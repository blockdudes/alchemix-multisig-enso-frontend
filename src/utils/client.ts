import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_KEY;

export const client = createThirdwebClient({
  clientId: clientId,
});