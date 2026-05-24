export const DarkButton = ({children , onClick , size = 'small'} : {children : React.ReactNode , onClick : () => void , size : 'small' |  'big'}) => {
    return <button onClick={onClick} className={` ${size == 'small' ? 'px-4 py-2' : 'px-8 py-4'} bg-black text-white rounded-md hover:bg-gray-800 hover:text-white cursor-pointer`} > {children} </button>
}
