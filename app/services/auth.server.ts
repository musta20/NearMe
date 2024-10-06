import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import { login } from "~/lib/action"; // Import the login function

// Export the User type so it can be used in other files
export type User = {
  username: string;
  email: string;
};

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
    new FormStrategy(async ({ form }) => {
      let email = form.get("email");
      let password = form.get("password");
     //  try{
        let user = await login(email, password).catch(e=> {
            //form.formError = "account not found";
            throw new Error("account not found");
        });
        // the type of this user must match the type you pass to the Authenticator
        // the strategy will automatically inherit the type if you instantiate
        // directly inside the `use` method
       // console.log(user)
        return user;
    //  }
      

    }),
    // each strategy has a name and can be changed to use another one
    // same strategy multiple times, especially useful for the OAuth2 strategy.
    "user-pass"
  );