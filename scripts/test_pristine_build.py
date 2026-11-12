#!/usr/bin/env python3
"""
Test build of pristine APK from Android Gradle intermediates:
- linked-resources-binary-format-release.ap_ (resources, manifest, arsc)
- mergeDexRelease (classes.dex 1..4)
- merged_native_libs (arm64-v8a and x86_64 .so files)
- mergeReleaseAssets (index.android.bundle with Razorpay test key patched in place, app.config)
- binary_art_profile (baseline.prof, baseline.profm)
- merged_java_res (base.jar META-INF)
- app_metadata (app-metadata.properties)
Dual signed: jarsigner (v1) + APK Signature Scheme v2
4096-byte page aligned for .so native libraries
"""

import os
import sys
import struct
import hashlib
import zipfile
import zlib
import shutil
import subprocess
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import pkcs12, load_der_public_key

RELEASE_KEYSTORE = "/home/prakhar/Technokrate Hire/android/app/technokrate-release.keystore"
STORE_PASS = "technokrate123"
KEY_ALIAS = "technokrate-key"

INTERMEDIATES = "/home/prakhar/Technokrate Hire/android/app/build/intermediates"
AP_PATH = f"{INTERMEDIATES}/linked_resources_binary_format/release/processReleaseResources/linked-resources-binary-format-release.ap_"
DEX_DIR = f"{INTERMEDIATES}/dex/release/mergeDexRelease"
NATIVE_DIR = f"{INTERMEDIATES}/stripped_native_libs/release/stripReleaseDebugSymbols/out/lib"
BUNDLE_PATH = f"{INTERMEDIATES}/assets/release/mergeReleaseAssets/index.android.bundle"
CFG_PATH = f"{INTERMEDIATES}/assets/release/mergeReleaseAssets/app.config"
PROF_PATH = f"{INTERMEDIATES}/binary_art_profile/release/compileReleaseArtProfile/baseline.prof"
PROFM_PATH = f"{INTERMEDIATES}/binary_art_profile_metadata/release/compileReleaseArtProfile/baseline.profm"
BASE_JAR = f"{INTERMEDIATES}/merged_java_res/release/mergeReleaseJavaResource/base.jar"
APP_META = f"{INTERMEDIATES}/app_metadata/release/writeReleaseAppMetadata/app-metadata.properties"

TARGET_RAZORPAY_KEY = b"rzp_test_TlJxZPxz3RYdke"
OLD_RAZORPAY_KEY = b"rzp_test_1DP5mmOlF5G5ag"

def sign_apk_v2(aligned_apk_bytes, private_key, certificate):
    data = aligned_apk_bytes
    eocd_pos = data.rfind(b"\x50\x4b\x05\x06")
    if eocd_pos == -1:
        raise ValueError("EoCD not found in APK")
    
    cd_offset = struct.unpack("<I", data[eocd_pos+16:eocd_pos+20])[0]
    cd_size = struct.unpack("<I", data[eocd_pos+12:eocd_pos+16])[0]
    
    sec1 = data[:cd_offset]
    sec2 = data[cd_offset:cd_offset+cd_size]
    eocd = data[eocd_pos:]
    
    CHUNK_SIZE = 1048576
    chunk_hashes = []
    
    for section in [sec1, sec2, eocd]:
        for offset in range(0, len(section), CHUNK_SIZE):
            chunk = section[offset:offset+CHUNK_SIZE]
            header = b"\xa5" + struct.pack("<I", len(chunk))
            chunk_hashes.append(hashlib.sha256(header + chunk).digest())
            
    root_header = b"\x5a" + struct.pack("<I", len(chunk_hashes))
    apk_digest = hashlib.sha256(root_header + b"".join(chunk_hashes)).digest()
    
    digest_record = struct.pack("<I", 0x0103) + struct.pack("<I", len(apk_digest)) + apk_digest
    digest_record_prefixed = struct.pack("<I", len(digest_record)) + digest_record
    digests_sequence = struct.pack("<I", len(digest_record_prefixed)) + digest_record_prefixed

    cert_der = certificate.public_bytes(serialization.Encoding.DER)
    cert_record = struct.pack("<I", len(cert_der)) + cert_der
    certs_sequence = struct.pack("<I", len(cert_record)) + cert_record

    addl_attrs_sequence = struct.pack("<I", 0)
    signed_data = digests_sequence + certs_sequence + addl_attrs_sequence

    signature = private_key.sign(
        signed_data,
        padding.PKCS1v15(),
        hashes.SHA256()
    )

    sig_record = struct.pack("<I", 0x0103) + struct.pack("<I", len(signature)) + signature
    sig_record_prefixed = struct.pack("<I", len(sig_record)) + sig_record
    signatures_sequence = struct.pack("<I", len(sig_record_prefixed)) + sig_record_prefixed

    pub_key_der = certificate.public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo
    )
    public_key_sequence = struct.pack("<I", len(pub_key_der)) + pub_key_der

    signer_record = (
        struct.pack("<I", len(signed_data)) + signed_data +
        signatures_sequence +
        public_key_sequence
    )
    signer_record_prefixed = struct.pack("<I", len(signer_record)) + signer_record
    signers_sequence = struct.pack("<I", len(signer_record_prefixed)) + signer_record_prefixed

    v2_pair = struct.pack("<I", 0x7109871a) + signers_sequence
    pair_entry = struct.pack("<Q", len(v2_pair)) + v2_pair

    block_size = len(pair_entry) + 24
    N = block_size + 8

    magic = b"APK Sig Block 42"
    apk_sig_block = (
        struct.pack("<Q", block_size) +
        pair_entry +
        struct.pack("<Q", block_size) +
        magic
    )
    assert len(apk_sig_block) == N

    new_cd_offset = cd_offset + N
    final_eocd = bytearray(eocd)
    final_eocd[16:20] = struct.pack("<I", new_cd_offset)

    final_apk = sec1 + apk_sig_block + sec2 + bytes(final_eocd)
    return final_apk

def verify_apk_v2(apk_path):
    print(f"[*] Verifying APK v2 signature on: {apk_path}")
    with open(apk_path, "rb") as f:
        data = f.read()

    eocd_pos = data.rfind(b"\x50\x4b\x05\x06")
    cd_offset = struct.unpack("<I", data[eocd_pos+16:eocd_pos+20])[0]
    cd_size = struct.unpack("<I", data[eocd_pos+12:eocd_pos+16])[0]
    block_size = struct.unpack("<Q", data[cd_offset - 24:cd_offset - 16])[0]
    block_start = cd_offset - block_size - 8

    p = block_start + 8
    end = cd_offset - 24
    v2_data = None
    while p < end:
        pair_size = struct.unpack("<Q", data[p:p+8])[0]
        pair_id = struct.unpack("<I", data[p+8:p+12])[0]
        if pair_id == 0x7109871a:
            v2_data = data[p+12:p+8+pair_size]
            break
        p += 8 + pair_size

    if not v2_data:
        raise ValueError("No v2 signature pair found in APK Signing Block")

    def get_slice(buf, off):
        l = struct.unpack("<I", buf[off:off+4])[0]
        return buf[off+4:off+4+l], off+4+l

    signers_body, _ = get_slice(v2_data, 0)
    signer_body, _ = get_slice(signers_body, 0)

    signed_data_parsed, next_off = get_slice(signer_body, 0)
    signatures_parsed, next_off = get_slice(signer_body, next_off)
    public_key_parsed, next_off = get_slice(signer_body, next_off)

    digests_parsed, sd_off = get_slice(signed_data_parsed, 0)
    certs_parsed, sd_off = get_slice(signed_data_parsed, sd_off)

    d1, _ = get_slice(digests_parsed, 0)
    algo = struct.unpack("<I", d1[:4])[0]
    expected_digest, _ = get_slice(d1, 4)

    s1, _ = get_slice(signatures_parsed, 0)
    s_algo = struct.unpack("<I", s1[:4])[0]
    sig_bytes, _ = get_slice(s1, 4)

    pubkey = load_der_public_key(public_key_parsed)
    pubkey.verify(sig_bytes, signed_data_parsed, padding.PKCS1v15(), hashes.SHA256())
    print("    [+] RSA Cryptographic Signature: VALID (AOSP Specification Compliant)")

    sec1 = data[:block_start]
    sec2 = data[cd_offset:cd_offset+cd_size]
    mod_eocd = bytearray(data[eocd_pos:])
    mod_eocd[16:20] = struct.pack("<I", block_start)

    CHUNK_SIZE = 1048576
    chunk_hashes = []
    for section in [sec1, sec2, bytes(mod_eocd)]:
        for offset in range(0, len(section), CHUNK_SIZE):
            chunk = section[offset:offset+CHUNK_SIZE]
            header = b"\xa5" + struct.pack("<I", len(chunk))
            chunk_hashes.append(hashlib.sha256(header + chunk).digest())

    root_header = b"\x5a" + struct.pack("<I", len(chunk_hashes))
    computed_digest = hashlib.sha256(root_header + b"".join(chunk_hashes)).digest()

    if computed_digest != expected_digest:
        raise ValueError(f"Digest mismatch! Computed: {computed_digest.hex()}, Expected: {expected_digest.hex()}")
    print(f"    [+] APK Digest Verification: MATCH ({computed_digest.hex()[:16]}...)")
    print("[*] APK v2 verification PASSED successfully!\n")

def zipalign_apk(in_path, out_path):
    print("[*] Aligning APK (4096-byte for .so, 4-byte for resources.arsc & others)...")
    with open(in_path, "rb") as f:
        in_data = f.read()

    eocd_pos = in_data.rfind(b"\x50\x4b\x05\x06")
    if eocd_pos == -1:
        raise ValueError("EoCD not found")
    cd_offset = struct.unpack("<I", in_data[eocd_pos+16:eocd_pos+20])[0]
    total_entries = struct.unpack("<H", in_data[eocd_pos+10:eocd_pos+12])[0]
    eocd_comment_len = struct.unpack("<H", in_data[eocd_pos+20:eocd_pos+22])[0]
    eocd_comment = in_data[eocd_pos+22:eocd_pos+22+eocd_comment_len]

    entries = []
    p = cd_offset
    for _ in range(total_entries):
        sig = in_data[p:p+4]
        if sig != b"\x50\x4b\x01\x02":
            break
        version_made_by = in_data[p+4:p+6]
        version_needed = in_data[p+6:p+8]
        flags = in_data[p+8:p+10]
        comp_method = struct.unpack("<H", in_data[p+10:p+12])[0]
        last_mod_time = in_data[p+12:p+14]
        last_mod_date = in_data[p+14:p+16]
        crc32 = in_data[p+16:p+20]
        comp_size = struct.unpack("<I", in_data[p+20:p+24])[0]
        uncomp_size = struct.unpack("<I", in_data[p+24:p+28])[0]
        name_len = struct.unpack("<H", in_data[p+28:p+30])[0]
        extra_len = struct.unpack("<H", in_data[p+30:p+32])[0]
        comm_len = struct.unpack("<H", in_data[p+32:p+34])[0]
        disk_num_start = in_data[p+34:p+36]
        internal_attr = in_data[p+36:p+38]
        external_attr = in_data[p+38:p+42]
        local_header_offset = struct.unpack("<I", in_data[p+42:p+46])[0]

        filename = in_data[p+46:p+46+name_len]
        comment = in_data[p+46+name_len+extra_len:p+46+name_len+extra_len+comm_len]

        p += 46 + name_len + extra_len + comm_len

        lh = local_header_offset
        assert in_data[lh:lh+4] == b"\x50\x4b\x03\x04"
        lh_name_len = struct.unpack("<H", in_data[lh+26:lh+28])[0]
        lh_extra_len = struct.unpack("<H", in_data[lh+28:lh+30])[0]
        data_start = lh + 30 + lh_name_len + lh_extra_len
        file_data = in_data[data_start:data_start+comp_size]

        entries.append({
            "version_made_by": version_made_by,
            "version_needed": version_needed,
            "flags": flags,
            "comp_method": comp_method,
            "last_mod_time": last_mod_time,
            "last_mod_date": last_mod_date,
            "crc32": crc32,
            "comp_size": comp_size,
            "uncomp_size": uncomp_size,
            "filename": filename,
            "disk_num_start": disk_num_start,
            "internal_attr": internal_attr,
            "external_attr": external_attr,
            "comment": comment,
            "file_data": file_data,
        })

    out_parts = []
    out_len = 0
    cd_entries = []

    for e in entries:
        lh_offset = out_len
        fname = e["filename"]
        fname_len = len(fname)
        comp_m = e["comp_method"]

        if comp_m == 0:
            align = 4096 if fname.endswith(b".so") else 4
            header_size = 30 + fname_len
            current_payload_offset = lh_offset + header_size
            pad = (align - (current_payload_offset % align)) % align
            extra_field = b"\x00" * pad
        else:
            extra_field = b""

        new_comp_size = len(e["file_data"])
        new_uncomp_size = e["uncomp_size"]
        new_crc = e["crc32"]

        lh = (
            b"\x50\x4b\x03\x04" +
            e["version_needed"] +
            e["flags"] +
            struct.pack("<H", comp_m) +
            e["last_mod_time"] +
            e["last_mod_date"] +
            new_crc +
            struct.pack("<II", new_comp_size, new_uncomp_size) +
            struct.pack("<HH", fname_len, len(extra_field)) +
            fname +
            extra_field
        )

        out_parts.append(lh)
        out_parts.append(e["file_data"])
        out_len += len(lh) + len(e["file_data"])

        cd_entries.append((e, lh_offset, extra_field))

    new_cd_offset = out_len
    cd_data_parts = []
    for e, lh_off, extra_field in cd_entries:
        fname = e["filename"]
        cd_hdr = (
            b"\x50\x4b\x01\x02" +
            e["version_made_by"] +
            e["version_needed"] +
            e["flags"] +
            struct.pack("<H", e["comp_method"]) +
            e["last_mod_time"] +
            e["last_mod_date"] +
            e["crc32"] +
            struct.pack("<II", len(e["file_data"]), e["uncomp_size"]) +
            struct.pack("<HHH", len(fname), len(extra_field), len(e["comment"])) +
            e["disk_num_start"] +
            e["internal_attr"] +
            e["external_attr"] +
            struct.pack("<I", lh_off) +
            fname +
            extra_field +
            e["comment"]
        )
        cd_data_parts.append(cd_hdr)

    cd_data = b"".join(cd_data_parts)
    out_parts.append(cd_data)
    new_cd_size = len(cd_data)

    new_eocd = (
        b"\x50\x4b\x05\x06" +
        b"\x00\x00" +
        b"\x00\x00" +
        struct.pack("<HHIIH", len(cd_entries), len(cd_entries), new_cd_size, new_cd_offset, len(eocd_comment)) +
        eocd_comment
    )
    out_parts.append(new_eocd)

    final_aligned_bytes = b"".join(out_parts)
    with open(out_path, "wb") as f:
        f.write(final_aligned_bytes)
    print(f"    [+] Successfully aligned {len(cd_entries)} entries ({len(final_aligned_bytes):,} bytes)")

def verify_alignment(apk_path):
    with open(apk_path, "rb") as f:
        data = f.read()

    eocd_pos = data.rfind(b"\x50\x4b\x05\x06")
    cd_offset = struct.unpack("<I", data[eocd_pos+16:eocd_pos+20])[0]
    total_entries = struct.unpack("<H", data[eocd_pos+10:eocd_pos+12])[0]

    p = cd_offset
    misaligned = 0
    for _ in range(total_entries):
        comp_method = struct.unpack("<H", data[p+10:p+12])[0]
        name_len = struct.unpack("<H", data[p+28:p+30])[0]
        extra_len = struct.unpack("<H", data[p+30:p+32])[0]
        comm_len = struct.unpack("<H", data[p+32:p+34])[0]
        lh_off = struct.unpack("<I", data[p+42:p+46])[0]
        filename = data[p+46:p+46+name_len].decode("utf-8", errors="ignore")

        lh_name_len = struct.unpack("<H", data[lh_off+26:lh_off+28])[0]
        lh_extra_len = struct.unpack("<H", data[lh_off+28:lh_off+30])[0]
        data_offset = lh_off + 30 + lh_name_len + lh_extra_len

        if comp_method == 0:
            align = 4096 if filename.endswith(".so") else 4
            if data_offset % align != 0:
                misaligned += 1
        p += 46 + name_len + extra_len + comm_len
    if misaligned > 0:
        raise ValueError(f"Alignment verification failed: {misaligned} files misaligned!")
    print("    [+] Zip Alignment Verification: 0 misaligned files (PERFECT)")

def assemble_pristine_unaligned_apk(out_apk_path):
    print("[*] Assembling pristine unaligned APK from build intermediates...")
    
    entries = []

    # 1. From linked-resources-binary-format-release.ap_
    print("  [1/7] Adding AAPT2 compiled resources from .ap_...")
    with zipfile.ZipFile(AP_PATH, "r") as zf_ap:
        with open(AP_PATH, "rb") as f_ap:
            raw_ap_bytes = f_ap.read()
        for info in zf_ap.infolist():
            lh = info.header_offset
            fn_len = struct.unpack("<H", raw_ap_bytes[lh+26:lh+28])[0]
            ex_len = struct.unpack("<H", raw_ap_bytes[lh+28:lh+30])[0]
            data_start = lh + 30 + fn_len + ex_len
            raw_data = raw_ap_bytes[data_start : data_start + info.compress_size]
            entries.append({
                "filename": info.filename,
                "raw_bytes": raw_data,
                "compress_type": info.compress_type,
                "uncompressed_size": info.file_size,
                "compressed_size": info.compress_size,
                "crc": info.CRC,
            })

    # 2. From mergeDexRelease
    print("  [2/7] Adding DEX classes 1..4...")
    for dname in ["classes.dex", "classes2.dex", "classes3.dex", "classes4.dex"]:
        dpath = os.path.join(DEX_DIR, dname)
        with open(dpath, "rb") as f:
            dex_data = f.read()
        c_obj = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
        c_bytes = c_obj.compress(dex_data) + c_obj.flush()
        entries.append({
            "filename": dname,
            "raw_bytes": c_bytes,
            "compress_type": zipfile.ZIP_DEFLATED,
            "uncompressed_size": len(dex_data),
            "compressed_size": len(c_bytes),
            "crc": zipfile.crc32(dex_data) & 0xffffffff,
        })

    # 3. Native libraries (STORED, uncompressed)
    print("  [3/7] Adding native libraries (.so)...")
    for arch in ["arm64-v8a", "x86_64"]:
        arch_dir = os.path.join(NATIVE_DIR, arch)
        if not os.path.exists(arch_dir):
            continue
        for so_file in sorted(os.listdir(arch_dir)):
            if not so_file.endswith(".so"):
                continue
            so_path = os.path.join(arch_dir, so_file)
            with open(so_path, "rb") as f:
                so_data = f.read()
            entries.append({
                "filename": f"lib/{arch}/{so_file}",
                "raw_bytes": so_data,
                "compress_type": zipfile.ZIP_STORED,
                "uncompressed_size": len(so_data),
                "compressed_size": len(so_data),
                "crc": zipfile.crc32(so_data) & 0xffffffff,
            })

    # 4. Production JS Bundle with in-place patched Razorpay Key
    print("  [4/7] Adding production JS bundle and app.config...")
    with open(BUNDLE_PATH, "rb") as f:
        bundle_data = f.read()
    assert OLD_RAZORPAY_KEY in bundle_data, f"Old key {OLD_RAZORPAY_KEY} not in bundle!"
    bundle_data = bundle_data.replace(OLD_RAZORPAY_KEY, TARGET_RAZORPAY_KEY)
    assert TARGET_RAZORPAY_KEY in bundle_data, "Target key missing in bundle!"
    c_obj = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
    c_bundle = c_obj.compress(bundle_data) + c_obj.flush()
    entries.append({
        "filename": "assets/index.android.bundle",
        "raw_bytes": c_bundle,
        "compress_type": zipfile.ZIP_DEFLATED,
        "uncompressed_size": len(bundle_data),
        "compressed_size": len(c_bundle),
        "crc": zipfile.crc32(bundle_data) & 0xffffffff,
    })

    with open(CFG_PATH, "rb") as f:
        cfg_data = f.read()
    c_obj = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
    c_cfg = c_obj.compress(cfg_data) + c_obj.flush()
    entries.append({
        "filename": "assets/app.config",
        "raw_bytes": c_cfg,
        "compress_type": zipfile.ZIP_DEFLATED,
        "uncompressed_size": len(cfg_data),
        "compressed_size": len(c_cfg),
        "crc": zipfile.crc32(cfg_data) & 0xffffffff,
    })

    # 5. Art Profiles
    print("  [5/7] Adding ART profiles...")
    for prof_name, p_file in [("assets/dexopt/baseline.prof", PROF_PATH), ("assets/dexopt/baseline.profm", PROFM_PATH)]:
        if os.path.exists(p_file):
            with open(p_file, "rb") as f:
                p_data = f.read()
            c_obj = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
            c_p = c_obj.compress(p_data) + c_obj.flush()
            entries.append({
                "filename": prof_name,
                "raw_bytes": c_p,
                "compress_type": zipfile.ZIP_DEFLATED,
                "uncompressed_size": len(p_data),
                "compressed_size": len(c_p),
                "crc": zipfile.crc32(p_data) & 0xffffffff,
            })

    # 6. Merged Java Resources (base.jar META-INF)
    print("  [6/7] Adding Java resources from base.jar...")
    with zipfile.ZipFile(BASE_JAR, "r") as zf_jar:
        for item in zf_jar.infolist():
            if item.filename.endswith("/") or item.filename.startswith("META-INF/*.SF") or item.filename.startswith("META-INF/*.RSA"):
                continue
            jar_data = zf_jar.read(item.filename)
            c_obj = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
            c_jar = c_obj.compress(jar_data) + c_obj.flush()
            entries.append({
                "filename": item.filename,
                "raw_bytes": c_jar,
                "compress_type": zipfile.ZIP_DEFLATED,
                "uncompressed_size": len(jar_data),
                "compressed_size": len(c_jar),
                "crc": zipfile.crc32(jar_data) & 0xffffffff,
            })

    # 7. App metadata
    print("  [7/7] Adding app metadata...")
    if os.path.exists(APP_META):
        with open(APP_META, "rb") as f:
            meta_data = f.read()
        c_obj = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION, zlib.DEFLATED, -15)
        c_meta = c_obj.compress(meta_data) + c_obj.flush()
        entries.append({
            "filename": "META-INF/com/android/build/gradle/app-metadata.properties",
            "raw_bytes": c_meta,
            "compress_type": zipfile.ZIP_DEFLATED,
            "uncompressed_size": len(meta_data),
            "compressed_size": len(c_meta),
            "crc": zipfile.crc32(meta_data) & 0xffffffff,
        })

    print(f"[*] Packaging {len(entries)} entries into zip...")
    out_bio = bytearray()
    cd_entries = []

    for item in entries:
        filename_bytes = item["filename"].encode("utf-8")
        raw_bytes = item["raw_bytes"]
        compress_type = item["compress_type"]
        crc = item["crc"]
        uncompressed_size = item["uncompressed_size"]
        compressed_size = item["compressed_size"]
        local_header_offset = len(out_bio)

        local_header = struct.pack(
            "<IHHHHHIIIHH",
            0x04034b50,       # signature
            20,               # version needed to extract
            0x0800,           # general purpose bit flag (UTF-8)
            compress_type,    # compression method
            0, 0,             # time, date
            crc,              # CRC-32
            compressed_size,
            uncompressed_size,
            len(filename_bytes),
            0                 # extra field length
        )
        out_bio.extend(local_header)
        out_bio.extend(filename_bytes)
        out_bio.extend(raw_bytes)

        cd_entries.append({
            "filename_bytes": filename_bytes,
            "compress_type": compress_type,
            "crc": crc,
            "compressed_size": compressed_size,
            "uncompressed_size": uncompressed_size,
            "local_header_offset": local_header_offset
        })

    cd_start_offset = len(out_bio)
    for cde in cd_entries:
        cd_header = struct.pack(
            "<IHHHHHHIIIHHHHHII",
            0x02014b50,       # central file header signature
            20,               # version made by
            20,               # version needed to extract
            0x0800,           # flags (UTF-8)
            cde["compress_type"],
            0, 0,             # time, date
            cde["crc"],
            cde["compressed_size"],
            cde["uncompressed_size"],
            len(cde["filename_bytes"]),
            0,                # extra field length
            0,                # file comment length
            0,                # disk number start
            0,                # internal file attributes
            0,                # external file attributes
            cde["local_header_offset"]
        )
        out_bio.extend(cd_header)
        out_bio.extend(cde["filename_bytes"])

    cd_size = len(out_bio) - cd_start_offset
    eocd = struct.pack(
        "<IHHHHIIH",
        0x06054b50,       # EoCD signature
        0,                # disk number
        0,                # disk with CD
        len(cd_entries),  # total entries on this disk
        len(cd_entries),  # total entries
        cd_size,
        cd_start_offset,
        0                 # comment length
    )
    out_bio.extend(eocd)

    with open(out_apk_path, "wb") as f:
        f.write(out_bio)
    print(f"[*] Wrote unaligned base APK: {out_apk_path} ({len(out_bio):,} bytes, {len(cd_entries)} entries)")

def main():
    print("==================================================")
    print("  TECHNOKRATE HIRE - PRISTINE APK BUILD & SIGN")
    print("==================================================")

    with open(RELEASE_KEYSTORE, "rb") as f:
        key, cert, _ = pkcs12.load_key_and_certificates(f.read(), STORE_PASS.encode())
    print(f"[*] Loaded Release Keystore: {cert.subject.rfc4514_string()}")

    unaligned_apk = "/tmp/technokrate-pristine-unaligned.apk"
    assemble_pristine_unaligned_apk(unaligned_apk)

    # jarsigner (v1)
    print("[*] Signing with jarsigner (v1)...")
    res = subprocess.run([
        "jarsigner",
        "-keystore", RELEASE_KEYSTORE,
        "-storepass", STORE_PASS,
        "-keypass", STORE_PASS,
        "-sigalg", "SHA256withRSA",
        "-digestalg", "SHA-256",
        unaligned_apk,
        KEY_ALIAS
    ], capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"jarsigner failed: {res.stderr}")
    print("    [+] v1 signature applied!")

    # zipalign
    aligned_apk = "/tmp/technokrate-pristine-aligned.apk"
    zipalign_apk(unaligned_apk, aligned_apk)
    verify_alignment(aligned_apk)

    # verify v1 on aligned
    res_verify = subprocess.run(["jarsigner", "-verify", aligned_apk], capture_output=True, text=True)
    if "jar verified." not in res_verify.stdout:
        raise RuntimeError(f"jarsigner verify failed on aligned file: {res_verify.stdout}")
    print("    [+] v1 signature verified on aligned file!")

    # sign v2
    with open(aligned_apk, "rb") as f:
        aligned_bytes = f.read()
    v2_apk_bytes = sign_apk_v2(aligned_bytes, key, cert)

    final_apk = "/tmp/Technokrate-Hire-Pristine.apk"
    with open(final_apk, "wb") as f:
        f.write(v2_apk_bytes)
    print(f"[*] Dual-signed pristine APK: {len(v2_apk_bytes):,} bytes")

    # verify v2 and alignment on final APK
    verify_apk_v2(final_apk)
    verify_alignment(final_apk)

    # verify contents
    with zipfile.ZipFile(final_apk, "r") as zf:
        namelist = set(zf.namelist())
        assert "classes.dex" in namelist
        assert "classes4.dex" in namelist
        assert "lib/arm64-v8a/libreactnative.so" in namelist
        assert "lib/arm64-v8a/libhermesvm.so" in namelist
        assert "assets/index.android.bundle" in namelist
        b_data = zf.read("assets/index.android.bundle")
        assert TARGET_RAZORPAY_KEY in b_data
        assert OLD_RAZORPAY_KEY not in b_data
        print(f"    [+] Content checks: {len(namelist)} entries, genuine DEX, native libs & Razorpay test key verified!")

    dest_project = "/home/prakhar/Technokrate Hire/Technokrate-Hire-release.apk"
    shutil.copyfile(final_apk, dest_project)
    print(f"[*] Copied to: {dest_project}")

if __name__ == "__main__":
    main()
