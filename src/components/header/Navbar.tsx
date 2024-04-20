import { Connect } from '@/hooks/Connect'
import { ModeToggle } from '../mode-toggle'
import logo from '../../assets/alchemix-logo.svg'
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/dashboard');
    };

    return (
        <>
            <div className="flex justify-between p-6">
                <div className="relative" onClick={handleRedirect}>
                    <img src={logo} alt="Alchemix" className="w-40 cursor-pointer" />
                    <Badge variant="outline" className='absolute -right-12 border-none bottom-6 text-xs font-light'>admin</Badge>
                </div>
                <div className="flex justify-center items-center gap-6">
                    <Connect />
                    <Link to="/transaction" className='text-sm font-montserrat border rounded-md p-2 bg-neutral-900 '>Transactions</Link>
                    <ModeToggle />
                </div>
            </div>
        </>
    )
}

export default Navbar

