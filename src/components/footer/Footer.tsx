
const Footer = () => {
    return (

        <div className="">
            <div className="terms-privacy text-center text-sm text-muted-foreground px-8 mt-10 font-montserrat">
              By clicking "Connect Wallet", you agree to our{" "}
              <a href="/terms" className="terms-link underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="privacy-link underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>.
            </div>
        </div>
    )
}

export default Footer