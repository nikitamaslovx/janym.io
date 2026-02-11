import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold">
    <svg
      className="mr-1 size-8 stroke-current stroke-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0 0h24v24H0z" stroke="none" />
      <path d="M12 3l-4 4l-4 -4" />
      <path d="M4 7l4 4l4 -4" />
      <path d="M16 7l4 -4l-4 -4" />
      <path d="M16 11l4 4l-4 4" />
      <path d="M8 11l-4 4l4 4" />
      <path d="M12 21l4 -4l-4 -4" />
    </svg>
    {!props.isTextHidden && AppConfig.name}
  </div>
);
