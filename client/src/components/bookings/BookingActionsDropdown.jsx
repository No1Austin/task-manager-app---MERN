import { useEffect, useRef, useState } from "react";
import {
  Archive,
  BellPlus,
  ChevronRight,
  Clipboard,
  Eye,
  MoreVertical,
  Tag,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import DropdownItem from "./DropdownItem";

export default function BookingActionsDropdown({
  booking,
  groups,
  openMenu,
  setOpenMenu,
  expandedGroupMenu,
  setExpandedGroupMenu,
  onAction,
  onAddToGroup,
}) {
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    right: 16,
  });

  const isOpen = openMenu === booking.id;
  const groupExpanded = expandedGroupMenu === booking.id;

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = groupExpanded ? 430 : 340;
    const menuWidth = 288;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldDropUp = spaceBelow < menuHeight;

    const top = shouldDropUp
      ? Math.max(16, rect.top - menuHeight - 8)
      : rect.bottom + 8;

    const left = Math.min(
      window.innerWidth - menuWidth - 16,
      Math.max(16, rect.right - menuWidth)
    );

    setMenuPosition({ top, left });
  }, [isOpen, groupExpanded, booking.id]);

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setOpenMenu(isOpen ? null : booking.id);
            setExpandedGroupMenu(null);
          }}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed z-[99999] w-72 rounded-2xl border border-white/10 bg-[#0b1020] p-2 shadow-2xl shadow-black/50"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <DropdownItem
            icon={Eye}
            label="View details"
            onClick={() => onAction("view", booking)}
          />

          <button
            type="button"
            onClick={() =>
              setExpandedGroupMenu(groupExpanded ? null : booking.id)
            }
            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <span className="flex items-center gap-3">
              <Users size={16} />
              Add to group
            </span>

            <ChevronRight
              size={16}
              className={groupExpanded ? "rotate-90 transition" : "transition"}
            />
          </button>

          {groupExpanded && (
            <div className="ml-3 mt-1 max-h-44 space-y-1 overflow-y-auto border-l border-white/10 pl-3">
              {groups.length === 0 ? (
                <div className="rounded-xl px-3 py-2 text-xs text-slate-500">
                  No groups yet. Create one first.
                </div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => onAddToGroup(booking.id, group.id)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Users size={14} />
                    {group.name}
                  </button>
                ))
              )}
            </div>
          )}

          <DropdownItem
            icon={UserPlus}
            label="Create group"
            onClick={() => onAction("create-group", booking)}
          />

          <DropdownItem
            icon={Tag}
            label="Label customer"
            onClick={() => onAction("label", booking)}
          />

          <DropdownItem
            icon={BellPlus}
            label="Add follow-up task"
            onClick={() => onAction("follow-up", booking)}
          />

          <DropdownItem
            icon={Clipboard}
            label="Copy customer info"
            onClick={() => onAction("copy", booking)}
          />

          <div className="my-2 border-t border-white/10" />

          <DropdownItem
            icon={Archive}
            label="Archive booking"
            onClick={() => onAction("archive", booking)}
          />

          <DropdownItem
            danger
            icon={XCircle}
            label="Cancel booking"
            onClick={() => onAction("cancel", booking)}
          />
        </div>
      )}
    </>
  );
}