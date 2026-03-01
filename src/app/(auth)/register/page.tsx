import { Suspense } from "react";
import RegisterView from "./RegisterView";

const RegisterPage = () => {
  return (
    <Suspense>
      <RegisterView />
    </Suspense>
  );
};

export default RegisterPage;
