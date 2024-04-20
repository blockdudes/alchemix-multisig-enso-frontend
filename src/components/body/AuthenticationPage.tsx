import React from 'react';
import logo from '../../assets/alchemix-logo-round.svg';
import { Connect } from '@/hooks/Connect';
import Footer from '../footer/Footer';

export default function AuthenticationPage() {
  return (
    <>
      <div className="authentication-page fotn">

        {/* Main content container */}
        <div className="container main-content relative hidden md:grid lg:grid-cols-2 lg:px-20 justify-center items-center mt-32 font-montserrat">
          {/* Logo and branding section */}
          <div className="branding-section h-full lg:flex lg:flex-col lg:justify-start lg:p-16 text-white mt-20">
            <img src={logo} alt="Company Logo" className="w-3/4 mx-auto" />
          </div>

          {/* Authentication form section */}
          <div className="form-section lg:p-8 montserrat">
            <div className="form-container mx-auto flex w-full flex-col justify-center h-full gap-5">
              <div className="title-group text-center space-y-2 p-10">
                <h1 className="title text-4xl font-semibold tracking-tight">
                  Continue to Portal
                </h1>
                <p className="subtitle text-sm text-muted-foreground">
                  To continue, please connect your wallet.
                </p>
              </div>

              {/* User authentication form */}
              <div className="flex justify-center items-center">
                <Connect />
              </div>

              {/* Terms and privacy links */}

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
