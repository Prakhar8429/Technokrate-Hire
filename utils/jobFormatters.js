/**
 * Job data formatters and sanitizers to guarantee UI safety and crash-proof rendering.
 */

export function formatJobLocation(loc) {
  if (!loc) return 'Remote';
  if (typeof loc === 'string') {
    const trimmed = loc.trim();
    if (!trimmed || trimmed.toLowerCase() === 'n/a' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return 'Remote';
    }
    return trimmed;
  }

  if (Array.isArray(loc)) {
    const valid = loc
      .map((item) => formatJobLocation(item))
      .filter((s) => s && s !== 'Remote');
    if (valid.length > 0) {
      return Array.from(new Set(valid)).join(', ');
    }
    return 'Remote';
  }

  if (typeof loc === 'object') {
    const city = (loc.cityName || loc.city || (loc.name && !loc.name.includes('{') ? loc.name : '') || '').trim();
    const state = (loc.state || loc.stateName || '').trim();
    const country = (loc.country || loc.countryName || '').trim();

    const parts = [];
    if (city && city.toLowerCase() !== 'n/a') parts.push(city);
    if (state && state.toLowerCase() !== 'n/a' && !parts.includes(state)) parts.push(state);
    if (country && country.toLowerCase() !== 'n/a' && !parts.includes(country)) parts.push(country);

    if (parts.length > 0) {
      return parts.join(', ');
    }

    if (loc.isoCode && typeof loc.isoCode === 'string' && loc.isoCode.trim()) {
      return loc.isoCode.trim();
    }
  }

  return 'Remote';
}

export function extractLocationCity(loc) {
  if (!loc) return 'Remote';
  if (typeof loc === 'object' && !Array.isArray(loc)) {
    if (loc.city && typeof loc.city === 'string' && loc.city.trim()) return loc.city.trim();
    if (loc.cityName && typeof loc.cityName === 'string' && loc.cityName.trim()) return loc.cityName.trim();
    if (loc.state && typeof loc.state === 'string' && loc.state.trim()) return loc.state.trim();
    if (loc.name && typeof loc.name === 'string' && loc.name.trim()) return loc.name.trim();
  }
  const formatted = formatJobLocation(loc);
  if (formatted.includes(',')) {
    return formatted.split(',')[0].trim();
  }
  if (formatted.includes('•')) {
    const parts = formatted.split('•').map((s) => s.trim());
    return parts[parts.length - 1] || parts[0] || 'Remote';
  }
  return formatted || 'Remote';
}

export function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  if (!html.includes('<') && !html.includes('&')) return html.trim();

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeJobLocationsList(locations, includeAll = true) {
  if (!Array.isArray(locations)) {
    return includeAll ? ['All', 'Remote'] : ['Remote'];
  }

  const cleanList = locations
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return (item.city || item.cityName || item.name || item.state || item.country || '').trim();
      }
      return '';
    })
    .filter((loc) => loc && loc.toLowerCase() !== 'all' && loc.toLowerCase() !== 'n/a');

  const unique = Array.from(new Set(cleanList));
  if (includeAll) {
    return ['All', ...unique];
  }
  return unique;
}

export function normalizeJobTitlesList(titles) {
  if (!Array.isArray(titles)) return [];
  const clean = titles
    .map((t) => (typeof t === 'string' ? t.trim() : (t?.name || t?.title || '').trim()))
    .filter(Boolean);
  return Array.from(new Set(clean));
}

export function normalizeJob(rawJob, savedJobIds = null, appliedJobIds = null) {
  if (!rawJob || typeof rawJob !== 'object') return null;

  const id = rawJob._id || rawJob.id || String(Math.random());
  const locFormatted = formatJobLocation(rawJob.jobLocation);
  const city = rawJob.locationCity || extractLocationCity(rawJob.jobLocation);

  const companyName =
    rawJob.companyName ||
    rawJob.employerId?.name ||
    rawJob.employerId?.companyDetail?.companyName ||
    'Technokrate Partner';

  const companyLogo =
    rawJob.companyLogo ||
    rawJob.employerId?.companyLogo ||
    rawJob.employerId?.companyDetail?.companyLogo ||
    'https://res.cloudinary.com/dusonmyyp/image/upload/v1773810202/company_logos/1773810201754-company-logo.jpg';

  const jobType =
    (typeof rawJob.jobType === 'string' && rawJob.jobType.trim()) ||
    (typeof rawJob.advanceInformation?.jobType === 'string' && rawJob.advanceInformation.jobType.trim()) ||
    'Full-Time';

  const experience =
    (typeof rawJob.experience === 'string' && rawJob.experience) ||
    (typeof rawJob.advanceInformation?.experience === 'string' && rawJob.advanceInformation.experience) ||
    'Fresher';

  let education = 'Graduate';
  const rawEdu = rawJob.education || rawJob.advanceInformation?.education;
  if (Array.isArray(rawEdu)) {
    const eduItems = rawEdu.map((e) => (typeof e === 'string' ? e.trim() : (e?.name || String(e)).trim())).filter(Boolean);
    if (eduItems.length > 0) education = eduItems.join(', ');
  } else if (typeof rawEdu === 'string' && rawEdu.trim()) {
    education = rawEdu.trim();
  }

  const jobLevel =
    (typeof rawJob.jobLevel === 'string' && rawJob.jobLevel) ||
    (typeof rawJob.advanceInformation?.jobLevel === 'string' && rawJob.advanceInformation.jobLevel) ||
    'Entry-Level';

  let skillsRequired = [];
  if (Array.isArray(rawJob.skillsRequired)) {
    skillsRequired = rawJob.skillsRequired
      .map((s) => (typeof s === 'string' ? s.trim() : (s?.name || s?.skill || String(s)).trim()))
      .filter(Boolean);
  }

  let salaryFormatted = typeof rawJob.salaryFormatted === 'string' ? rawJob.salaryFormatted : null;
  if (!salaryFormatted) {
    if (rawJob.salaryRange && (rawJob.salaryRange.minSalary || rawJob.salaryRange.maxSalary)) {
      const min = Number(rawJob.salaryRange.minSalary || 0).toLocaleString('en-IN');
      const max = Number(rawJob.salaryRange.maxSalary || 0).toLocaleString('en-IN');
      const type = rawJob.salaryType ? ` / ${String(rawJob.salaryType).toLowerCase()}` : ' / month';
      salaryFormatted = `₹${min} - ₹${max}${type}`;
    } else {
      salaryFormatted = 'Competitive';
    }
  }

  // Friendly job role display: hide raw 24-character hexadecimal ObjectId
  let jobRole = typeof rawJob.jobRole === 'string' ? rawJob.jobRole : '';
  if (!jobRole || /^[0-9a-fA-F]{24}$/.test(jobRole)) {
    jobRole = rawJob.category || 'Engineering Team';
  }

  const isSaved = savedJobIds ? savedJobIds.has(id) : Boolean(rawJob.isSaved);
  const isApplied = appliedJobIds ? appliedJobIds.has(id) : Boolean(rawJob.isApplied);

  return {
    ...rawJob,
    _id: id,
    companyName,
    companyLogo,
    jobTitle: rawJob.jobTitle || 'Job Opening',
    jobRole,
    jobLocation: locFormatted,
    locationCity: city,
    jobType,
    experience,
    education,
    jobLevel,
    skillsRequired,
    salaryFormatted,
    jobDescription: stripHtml(rawJob.jobDescription || 'No description provided.'),
    jobResponsibilities: stripHtml(rawJob.jobResponsibilities || ''),
    isSaved,
    isApplied,
  };
}
