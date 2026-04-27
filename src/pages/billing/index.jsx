import { Helmet } from "react-helmet-async";
import BillingInt from "./billingInt";

export default function BillingIndex() {
  return (
    <>
      <Helmet>
        <title>Billing</title>
      </Helmet>
      <BillingInt />
    </>
  );
}