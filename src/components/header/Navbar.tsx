import { Connect } from '@/hooks/Connect'
import { ModeToggle } from '../mode-toggle'
import logo from '../../assets/alchemix-logo.svg'

const Navbar = () => {
    return (
        <>
            <div className="flex justify-between p-6">
                <img src={logo} alt="Alchemix" className="w-40" />
                <div className="flex justify-center items-center gap-6">
                    <Connect />
                    <ModeToggle />
                </div>
            </div>
        </>
    )
}

export default Navbar



