import UserCard from '@components/UserCard';
import { useMe } from '@ctx/currentUser';
import { UserFlag } from '@graphql.d';
import useKeyDown from '@lib/useKeyDown';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { createRef, useEffect } from 'react';
import { DOMReactWithoutJSON, UserPopupProps } from './types';

const POPUP_WIDTH = 200;
const POPUP_HEIGHT = 270;
const DEFAULT_POSITION = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  bottom: 0,
  right: 0,
  x: 0,
  y: 0,
} satisfies DOMReactWithoutJSON;

export const UserPopup: React.FC<UserPopupProps> = ({
  user,
  location,
  position = DEFAULT_POSITION,
  onClickOutside,
}) => {
  const { isFollowed } = useMe();
  const ref = createRef<HTMLDivElement>();

  useKeyDown(['Escape'], onClickOutside);

  const handleClickOutside = (event: MouseEvent) => {
    if (!ref.current) return;
    // If target is a child of #user-profile-portal, don't close the popup
    if (
      document
        .getElementById('user-profile-portal')
        ?.contains(event.target as Node)
    )
      return;

    if (ref.current && !ref.current.contains(event.target as Node)) {
      onClickOutside();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  if (!position || !document) return null;

  const container = document
    .getElementById('page-content')
    ?.getBoundingClientRect()!;

  const top =
    position.top + POPUP_HEIGHT > container.bottom
      ? position.top - POPUP_HEIGHT + position.height
      : position.top - POPUP_HEIGHT / 2 < container.top
      ? position.top
      : position.top - (POPUP_HEIGHT - position.height) / 2;

  const left =
    position.left + POPUP_WIDTH + position.width > container.right
      ? position.right - POPUP_WIDTH
      : position.left - POPUP_WIDTH / 2 < container.left
      ? position.left
      : position.left - (POPUP_WIDTH - position.width) / 2;

  return (
    <motion.div
      layoutId={`user-popup-${user.id}`}
      ref={ref}
      className={classNames(
        'bg-slate-200 dark:bg-slate-900 dark:to-slate-900 shadow-2xl shadow-slate-400/50 dark:shadow-black/50 rounded fixed left-0 top-0',
        isFollowed(user)
          ? 'border-blue-200 dark:border-blue-800'
          : 'border-emerald-200 dark:border-emerald-800',
      )}
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
    >
      <UserCard
        user={user}
        location={location}
        className={classNames(
          'max-h-[270px] h-[270px] !rounded-none !border-0',
          {
            'bg-gradient-to-b from-fuchsia-500/20 to-transparent':
              user.flags?.includes(UserFlag.SPONSOR),
          },
        )}
        buttonAlwaysShow={true}
      />
    </motion.div>
  );
};
