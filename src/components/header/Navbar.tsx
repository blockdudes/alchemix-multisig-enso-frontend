import { Connect } from '@/hooks/Connect'
import { ModeToggle } from '../mode-toggle'

const Navbar = () => {
    return (
        <>
            <div className="flex justify-between p-6">
                <h1 className="text-3xl font-bold justify-center items-center ">
                    Alchemix
                </h1>
                <div className="flex justify-center items-center gap-6">
                    <Connect />
                    <ModeToggle />
                </div>
            </div>
        </>
    )
}

export default Navbar



