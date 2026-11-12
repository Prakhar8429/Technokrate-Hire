import React, { useEffect } from "react";
import Layout from "../../../components/Layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import {
  markAllRead,
  clearNotifications,
  fetchNotifications,
} from "../../../redux/slice/notification/notificationSlice";
import { BsBellSlash } from "react-icons/bs";

const Notifications = () => {
  const dispatch = useDispatch();
  const { items: notifications } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    // Mark all as read when user visits the page
    dispatch(markAllRead());
  }, [dispatch]);

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* PAGE TITLE */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">
            Notifications{" "}
            {notifications.length > 0 && (
              <span className="text-sm font-normal text-gray-400">
                ({notifications.length})
              </span>
            )}
          </h2>
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch(clearNotifications())}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <BsBellSlash size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">No Notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          /* LIST */
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl px-6 py-5 flex justify-between items-start gap-4 transition-all
                  ${item.type === "success"
                    ? "bg-[#DFF8E2]"
                    : item.type === "error"
                    ? "bg-[#FFE4DE]"
                    : "bg-[#EEF2FF]"
                  }
                  ${!item.read ? "opacity-100" : "opacity-80"}
                `}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                    )}
                    <p className="font-medium text-[#2D2D2D]">{item.title}</p>
                  </div>
                  {item.desc && (
                    <p className="text-sm text-gray-600 mt-1 ml-4">{item.desc}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                  {item.time}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
