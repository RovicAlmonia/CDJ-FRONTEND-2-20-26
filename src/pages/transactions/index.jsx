import { Helmet } from "react-helmet-async";
import TransactionInt from "./transactionInt";

export default function TransactionIndex() {
  return (
    <>
      <Helmet>
        <title>Transactions</title>
      </Helmet>
      <TransactionInt />
    </>
  );
}