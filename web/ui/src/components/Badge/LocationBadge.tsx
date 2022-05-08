import Emoji from '@components/Emoji';
import classNames from 'classnames';
import { Location } from 'types/globals';
import { Badge } from './Badge';

export const LocationBadge = (location: Location) => {
  const isConnected = location.host ? true : false;

  return (
    <Badge color={isConnected ? 'green' : 'gray'}>
      <span
        className={classNames(
          'inline-flex rounded-full w-2 h-2',
          isConnected ? 'bg-emerald-500' : 'bg-slate-500'
        )}
      ></span>
      <span className="flex flex-row justify-center items-center text-sm mx-1">
        {isConnected ? location.host : 'Offline'}
      </span>
      <Emoji
        emoji="🇫🇷"
        size={14}
        className={classNames('mx-1', isConnected ? 'visible' : 'hidden')}
      />
    </Badge>
  );
};