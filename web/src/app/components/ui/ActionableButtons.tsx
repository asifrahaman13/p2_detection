/* eslint-disable @next/next/no-img-element */

interface ActionButtonProps {
  imgSrc: string;
  label: string;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  imgSrc,
  label,
  onClick,
}) => {
  return (
    <div className="flex items-center gap-4 cursor-pointer" onClick={onClick}>
      <div>
        <img src={imgSrc} alt={label} className="h-8 w-auto" />
      </div>
      <div>{label}</div>
    </div>
  );
};

export default ActionButton;
