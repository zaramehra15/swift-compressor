import { useState } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { useToast } from "@/hooks/use-toast";
import { Download, QrCode, Link as LinkIcon, Type, Mail, Phone, Wifi, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const QR_TYPES = [
    { id: "url", label: "URL", icon: LinkIcon, placeholder: "https://example.com" },
    { id: "text", label: "Text", icon: Type, placeholder: "Enter any text..." },
    { id: "email", label: "Email", icon: Mail, placeholder: "email@example.com" },
    { id: "phone", label: "Phone", icon: Phone, placeholder: "+1234567890" },
    { id: "wifi", label: "WiFi", icon: Wifi, placeholder: "Network name" },
    { id: "vcard", label: "vCard", icon: CreditCard, placeholder: "Full name" },
] as const;

const QrGenerator = () => {
    const [qrType, setQrType] = useState("url");
    const [inputValue, setInputValue] = useState("");
    const [wifiPassword, setWifiPassword] = useState("");
    const [wifiEncryption, setWifiEncryption] = useState("WPA");
    const [vcardEmail, setVcardEmail] = useState("");
    const [vcardPhone, setVcardPhone] = useState("");
    const [vcardOrg, setVcardOrg] = useState("");
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [size, setSize] = useState(300);
    const [errorCorrection, setErrorCorrection] = useState("M");
    const [qrDataUrl, setQrDataUrl] = useState("");
    const { toast } = useToast();

    const generateQrData = (): string => {
        switch (qrType) {
            case "url":
                return inputValue;
            case "text":
                return inputValue;
            case "email":
                return `mailto:${inputValue}`;
            case "phone":
                return `tel:${inputValue}`;
            case "wifi":
                return `WIFI:T:${wifiEncryption};S:${inputValue};P:${wifiPassword};;`;
            case "vcard":
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${inputValue}\nEMAIL:${vcardEmail}\nTEL:${vcardPhone}\nORG:${vcardOrg}\nEND:VCARD`;
            default:
                return inputValue;
        }
    };

    const generateQr = async () => {
        const data = generateQrData();
        if (!data.trim()) {
            toast({ title: "Empty input", description: "Please enter content for the QR code.", variant: "destructive" });
            return;
        }

        try {
            const QRCode = (await import("qrcode")).default;
            const dataUrl = await QRCode.toDataURL(data, {
                width: size,
                margin: 2,
                color: { dark: fgColor, light: bgColor },
                errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
            });
            setQrDataUrl(dataUrl);
        } catch {
            toast({ title: "QR Error", description: "Failed to generate QR code. Input may be too long.", variant: "destructive" });
        }
    };

    const downloadQr = (format: "png" | "svg") => {
        if (!qrDataUrl) return;

        if (format === "png") {
            const a = document.createElement("a");
            a.href = qrDataUrl;
            a.download = "qrcode.png";
            a.click();
            return;
        }

        // SVG export
        (async () => {
            try {
                const QRCode = (await import("qrcode")).default;
                const data = generateQrData();
                const svgString = await QRCode.toString(data, {
                    type: "svg",
                    width: size,
                    margin: 2,
                    color: { dark: fgColor, light: bgColor },
                    errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
                });
                const blob = new Blob([svgString], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "qrcode.svg";
                a.click();
                URL.revokeObjectURL(url);
            } catch {
                toast({ title: "Error", description: "Failed to generate SVG.", variant: "destructive" });
            }
        })();
    };

    const currentType = QR_TYPES.find((t) => t.id === qrType) || QR_TYPES[0];

    return (
        <>
            <Helmet>
                <title>QR Code Generator — Free Custom QR Codes Online | Finvestech Tools</title>
                <meta name="description" content="Generate custom QR codes for URLs, text, WiFi, email, phone numbers, and vCards for free. Customize colors, size, and error correction. Download as PNG or SVG." />
                <meta name="keywords" content="qr code generator, create qr code, qr maker, custom qr code, wifi qr code, vcard qr code, free qr generator" />
                <link rel="canonical" href="https://compress.finvestech.in/qr-generator" />
                <meta property="og:title" content="QR Code Generator — Free Custom QR Codes Online" />
                <meta property="og:description" content="Create custom QR codes for URLs, WiFi, contacts and more. Download as PNG or SVG." />
                <meta property="og:url" content="https://compress.finvestech.in/qr-generator" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Finvestech Tools" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="QR Code Generator — Free Custom QR Codes" />
                <meta name="twitter:description" content="Generate custom QR codes for free. URLs, WiFi, vCards and more." />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "QR Code Generator — Finvestech Tools",
                        "description": "Free online QR code generator with customization options",
                        "url": "https://compress.finvestech.in/qr-generator",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Web",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://compress.finvestech.in/" },
                            { "@type": "ListItem", "position": 2, "name": "QR Generator", "item": "https://compress.finvestech.in/qr-generator" }
                        ]
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <main className="flex-1 pt-24 pb-16 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                                <span className="text-primary">QR Code</span> Generator
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Create custom QR codes for URLs, WiFi, contacts, and more. Download as PNG or SVG.
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Input */}
                            <Card className="p-6 space-y-5">
                                <div>
                                    <Label className="text-sm font-medium mb-3 block">QR Code Type</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {QR_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <Button
                                                    key={type.id}
                                                    variant={qrType === type.id ? "default" : "outline"}
                                                    size="sm"
                                                    className={`flex items-center gap-1.5 text-xs ${qrType === type.id ? 'bg-primary text-primary-foreground' : ''}`}
                                                    onClick={() => { setQrType(type.id); setInputValue(""); setQrDataUrl(""); }}
                                                >
                                                    <Icon className="w-3.5 h-3.5" /> {type.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium mb-1 block">{currentType.label}</Label>
                                    {qrType === "text" ? (
                                        <textarea
                                            className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={currentType.placeholder}
                                        />
                                    ) : (
                                        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={currentType.placeholder} />
                                    )}
                                </div>

                                {qrType === "wifi" && (
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-sm mb-1 block">Password</Label>
                                            <Input value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder="WiFi password" />
                                        </div>
                                        <div>
                                            <Label className="text-sm mb-1 block">Encryption</Label>
                                            <Select value={wifiEncryption} onValueChange={setWifiEncryption}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                                    <SelectItem value="WEP">WEP</SelectItem>
                                                    <SelectItem value="nopass">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {qrType === "vcard" && (
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-sm mb-1 block">Email</Label>
                                            <Input value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} placeholder="email@example.com" />
                                        </div>
                                        <div>
                                            <Label className="text-sm mb-1 block">Phone</Label>
                                            <Input value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} placeholder="+1234567890" />
                                        </div>
                                        <div>
                                            <Label className="text-sm mb-1 block">Organization</Label>
                                            <Input value={vcardOrg} onChange={(e) => setVcardOrg(e.target.value)} placeholder="Company name" />
                                        </div>
                                    </div>
                                )}

                                {/* Customization */}
                                <div className="border-t pt-4 space-y-4">
                                    <h3 className="text-sm font-semibold">Customize</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs mb-1 block">Foreground</Label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                                                <span className="text-xs text-muted-foreground">{fgColor}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs mb-1 block">Background</Label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border" />
                                                <span className="text-xs text-muted-foreground">{bgColor}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1 block">Size: {size}px</Label>
                                        <Slider value={[size]} onValueChange={([v]) => setSize(v)} min={128} max={1024} step={32} />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1 block">Error Correction</Label>
                                        <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Low (7%)</SelectItem>
                                                <SelectItem value="M">Medium (15%)</SelectItem>
                                                <SelectItem value="Q">Quartile (25%)</SelectItem>
                                                <SelectItem value="H">High (30%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button className="w-full gap-2" size="lg" onClick={generateQr}>
                                    <QrCode className="w-5 h-5" /> Generate QR Code
                                </Button>
                            </Card>

                            {/* Preview */}
                            <Card className="p-6 flex flex-col items-center justify-center space-y-6">
                                {qrDataUrl ? (
                                    <>
                                        <div className="p-4 rounded-xl border bg-white">
                                            <img src={qrDataUrl} alt="QR Code" className="max-w-full" style={{ width: Math.min(size, 400), height: Math.min(size, 400) }} />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" onClick={() => downloadQr("png")} className="gap-1.5">
                                                <Download className="w-4 h-4" /> PNG
                                            </Button>
                                            <Button variant="outline" onClick={() => downloadQr("svg")} className="gap-1.5">
                                                <Download className="w-4 h-4" /> SVG
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-muted-foreground py-12">
                                        <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                        <p className="text-sm">Enter content and click "Generate" to create your QR code</p>
                                    </div>
                                )}
                            </Card>
                        </div>

                        <div className="mt-16 max-w-3xl mx-auto prose prose-sm text-muted-foreground">
                            <h2 className="text-2xl font-bold text-foreground">Free QR Code Generator</h2>
                            <p>Create QR codes for any purpose — website URLs, WiFi credentials, contact cards (vCard), email addresses, phone numbers, or plain text. Customize colors, size, and error correction level, then download as PNG or SVG.</p>
                            <h3 className="text-xl font-semibold text-foreground">Supported QR Types</h3>
                            <ul>
                                <li><strong>URL:</strong> Link to any website or webpage</li>
                                <li><strong>Text:</strong> Encode plain text or messages</li>
                                <li><strong>Email:</strong> Generate mailto: QR codes</li>
                                <li><strong>Phone:</strong> Create callable phone number QR codes</li>
                                <li><strong>WiFi:</strong> Share WiFi credentials (SSID, password, encryption)</li>
                                <li><strong>vCard:</strong> Share contact information (name, email, phone, company)</li>
                            </ul>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
};

export default QrGenerator;
