
export const ZapCell = ({
    name,
    index,
    onClick,
    onRightClick
}: {
    name?: string; 
    index: number;
    onClick: () => void;
    onRightClick?: () => void;
}) => {
    return <div onClick={onClick} onContextMenu={(e) => {
        e.preventDefault();
        if (onRightClick) onRightClick();
    }} className="border border-black py-8 px-8 flex w-[300px] justify-center cursor-pointer">
        <div className="flex text-xl">
            <div className="font-bold">
                {index}. 
            </div>
            <div>
                {name}
            </div>
        </div>
    </div>
}