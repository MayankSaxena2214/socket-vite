import { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        try {
            setIsProcessing(true);
            setErrorMessage("");

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
            });

            if (error) {
                setErrorMessage(
                    error.message || "Payment confirmation failed."
                );
            }
        } catch (error) {
            setErrorMessage(
                error.message || "Something went wrong."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || !elements || isProcessing}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isProcessing
                    ? "Processing payment..."
                    : "Pay $50.00"}
            </button>
        </form>
    );
};

const App = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const createPaymentIntent = async () => {
        try {
            setIsCreatingPayment(true);
            setErrorMessage("");

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/stripe-intent/payment-intent`,
                {
                    amount: 5000,
                }
            );

            if (!data.success) {
                throw new Error(
                    data.message || "Unable to create payment intent."
                );
            }

            setClientSecret(data.data.clientSecret);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Unable to create payment intent.";

            setErrorMessage(message);
        } finally {
            setIsCreatingPayment(false);
        }
    };

    const stripeOptions = {
        clientSecret,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#4f46e5",
                borderRadius: "8px",
            },
        },
    };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-10">
            <div className="mx-auto max-w-lg">
                <div className="mb-8 text-center">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        Stripe Demo
                    </p>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Complete your payment
                    </h1>

                    <p className="mt-3 text-slate-600">
                        This is a test payment using Stripe Sandbox.
                    </p>
                </div>

                <section className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Demo Product
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Test product payment
                            </p>
                        </div>

                        <p className="text-2xl font-bold text-slate-900">
                            $50.00
                        </p>
                    </div>

                    {!clientSecret && (
                        <button
                            type="button"
                            onClick={createPaymentIntent}
                            disabled={isCreatingPayment}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isCreatingPayment
                                ? "Preparing payment..."
                                : "Start payment"}
                        </button>
                    )}

                    {errorMessage && (
                        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    {clientSecret && (
                        <Elements
                            options={stripeOptions}
                            stripe={stripePromise}
                        >
                            <CheckoutForm />
                        </Elements>
                    )}
                </section>

                <p className="mt-5 text-center text-xs text-slate-500">
                    Payments are processed in Stripe test mode.
                </p>
            </div>
        </main>
    );
};

export default App;