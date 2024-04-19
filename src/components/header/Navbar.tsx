import { Connect } from '@/hooks/Connect'
import { ModeToggle } from '../mode-toggle'
import logo from '../../assets/alchemix-logo.svg'
import { Badge } from "@/components/ui/badge"


const Navbar = () => {
    return (
        <>
            <div className="flex justify-between p-6">
                <div className="relative">
                    <img src={logo} alt="Alchemix" className="w-40" />
                    <Badge variant="outline" className='absolute -right-12 border-none bottom-6 text-xs font-light'>admin</Badge>
                </div>
                <div className="flex justify-center items-center gap-6">
                    <Connect />
                    <ModeToggle />
                </div>
            </div>
        </>
    )
}

export default Navbar



