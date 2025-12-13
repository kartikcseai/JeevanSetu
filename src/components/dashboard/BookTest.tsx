
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Beaker, ShoppingCart, Check, Info } from "lucide-react";
import { useCart, TestItem } from "@/contexts/CartContext";
import { toast } from "sonner"; // Assuming sonner is used or I should use a simple alert if not found. Better to check package.json or just use standard alert if unsure, but toast is better. I'll stick to simple first or check context. 
// Actually, I don't see sonner imported anywhere. I'll use simple window.alert or console for "Booked" confirmation for now, or just UI feedback.
// Wait, the user didn't ask for a specific toast library. I'll skip toast for now to avoid errors, and just change button state.

const MEDICAL_TESTS: TestItem[] = [
    {
        id: "1",
        name: "Full Body Checkup",
        price: 2999,
        description: "A comprehensive health screening package that includes complete blood count, liver function tests, kidney function tests, lipid profile, thyroid profile, and more. Recommended for annual health monitoring."
    },
    {
        id: "2",
        name: "Blood Sugar Profile",
        price: 499,
        description: "Includes Fasting Blood Sugar (FBS) and HbA1c tests to monitor blood glucose levels over the last 3 months. Essential for diabetes screening and management."
    },
    {
        id: "3",
        name: "Thyroid Profile",
        price: 899,
        description: "Evaluates thyroid gland function by measuring T3, T4, and TSH levels. Helps in diagnosing hypothyroidism or hyperthyroidism."
    },
    {
        id: "4",
        name: "Kidney Function Test",
        price: 1299,
        description: "Assesses how well your kidneys are working. Includes tests for Urea, Creatinine, Uric Acid, and electrolytes like Sodium and Potassium."
    },
    {
        id: "5",
        name: "Lipid Profile",
        price: 699,
        description: "Measures cholesterol levels including HDL, LDL, and Triglycerides to assess cardiovascular health and risk of heart disease."
    },
    {
        id: "6",
        name: "Vitamin D Test",
        price: 1499,
        description: "Checks Vitamin D levels in the body, which is crucial for bone health, immune function, and regulation of calcium and phosphorus."
    }
];

export function BookTest() {
    const { cartItems, addToCart, removeFromCart, clearCart, totalAmount } = useCart();

    const handleAddToCart = (test: TestItem) => {
        addToCart(test);
        // Optional: specific feedback
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        // Mock booking process
        const testNames = cartItems.map(i => i.name).join(", ");
        alert(`Booking confirmed for: ${testNames}. Total: ₹${totalAmount}`);
        clearCart();
    };

    const isInCart = (id: string) => cartItems.some(item => item.id === id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,70%,50%)] flex items-center justify-center">
                            <Beaker className="w-6 h-6 text-primary-foreground" />
                        </div>
                        Book Medical Test
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Schedule your lab tests and health checkups
                    </p>
                </div>

                {/* Cart Summary / Checkout Button */}
                {cartItems.length > 0 && (
                    <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">{cartItems.length} test{cartItems.length !== 1 ? 's' : ''} added</span>
                            <span className="font-bold text-lg">₹{totalAmount}</span>
                        </div>
                        <Button onClick={handleCheckout} className="gap-2">
                            Checkout
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MEDICAL_TESTS.map((test) => {
                    const added = isInCart(test.id);
                    return (
                        <Card key={test.id} variant="interactive" className="group flex flex-col h-full">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{test.name}</CardTitle>
                                    <span className="font-bold text-primary">₹{test.price}</span>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {test.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-0 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full gap-2">
                                                <Info className="w-4 h-4" />
                                                Description
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>{test.name}</DialogTitle>
                                                <DialogDescription className="pt-4 text-base leading-relaxed">
                                                    {test.description}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex justify-between items-center mt-4">
                                                <span className="font-bold text-xl">₹{test.price}</span>
                                                <Button
                                                    onClick={() => !added && handleAddToCart(test)}
                                                    disabled={added}
                                                >
                                                    {added ? "Added to Cart" : "Add to Cart"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        className="w-full gap-2"
                                        variant={added ? "secondary" : "default"}
                                        onClick={() => added ? removeFromCart(test.id) : handleAddToCart(test)}
                                    >
                                        {added ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Added
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4" />
                                                Add
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
