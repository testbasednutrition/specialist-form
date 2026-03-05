"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from 'browser-image-compression';

export default function RegistrationForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        title: "",
        bio: "",
        credentials: "",
        testimonial1: "",
        testimonial2: "",
        testimonial3: "",
        clinicName: "",
        email: "",
        phone: "",
        address: "",
        primaryCategory: "",
        specificTitle: "",
        specializationTags: [] as string[],
        consultationType: "Both",
        acceptingClients: "Yes",
        testingMethods: [] as string[],
        newsHubInterest: "No",
        firstBalanceResult: "",
        secondBalanceResult: "",
        whyJoinedTBN: "",
        otherBloodTests: "",
    });

    const [profilePics, setProfilePics] = useState<File[]>([]);
    const [newsAttachments, setNewsAttachments] = useState<File[]>([]);

    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updates = { ...prev, [name]: value };
            // If primary category changes, reset the specific title and tags
            if (name === "primaryCategory") {
                updates.specificTitle = "";
                updates.specializationTags = [];
            }
            return updates;
        });
    };

    const handleCheckboxChange = (category: "specializationTags" | "testingMethods", value: string) => {
        setFormData((prev) => {
            const currentList = prev[category] as string[];
            if (currentList.includes(value)) {
                return { ...prev, [category]: currentList.filter((item) => item !== value) };
            }
            return { ...prev, [category]: [...currentList, value] };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles: File[] = [];
            const maxSizeMB = 5;
            let hasBigFiles = false;

            files.forEach(file => {
                if (file.size > maxSizeMB * 1024 * 1024) {
                    hasBigFiles = true;
                } else {
                    validFiles.push(file);
                }
            });

            if (hasBigFiles) {
                alert(`Some images were too large and skipped. Please ensure your pictures are under ${maxSizeMB}MB.`);
            }

            setProfilePics(validFiles);
        }
    };

    const handleNewsAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles: File[] = [];
            const maxSizeMB = 5;
            let hasBigFiles = false;

            files.forEach(file => {
                if (file.size > maxSizeMB * 1024 * 1024) {
                    hasBigFiles = true;
                } else {
                    validFiles.push(file);
                }
            });

            if (hasBigFiles) {
                alert(`Some files were too large and were skipped. Please ensure each attachment is under ${maxSizeMB}MB.`);
            }

            setNewsAttachments(validFiles);
        }
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, 6));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    // Validation logic
    const isStep1Valid = formData.firstName && formData.lastName && formData.title && formData.bio && getWordCount(formData.bio) <= 100;
    const isStep2Valid = formData.credentials && getWordCount(formData.credentials) <= 50;
    const isStep3Valid = formData.testimonial1 && getWordCount(formData.testimonial1) <= 50
        && getWordCount(formData.testimonial2) <= 50
        && getWordCount(formData.testimonial3) <= 50;
    const isStep4Valid = formData.email && formData.address;

    const canProceed = () => {
        if (step === 1) return isStep1Valid;
        if (step === 2) return isStep2Valid;
        if (step === 3) return isStep3Valid;
        if (step === 4) return isStep4Valid;
        if (step === 5) return true; // Optional categories for now
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step !== 6) {
            if (canProceed()) nextStep();
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            let mainImageUrl = null;
            let galleryUrls: string[] = [];
            let newsArticleUrls: string[] = [];

            if (supabase) {
                const supabaseClient = supabase;
                // 1. Upload Profile Images Concurrently
                if (profilePics.length > 0) {
                    const profileUploadPromises = profilePics.map(async (pic, i) => {
                        const fileExt = pic.name.split('.').pop();
                        const fileName = `${formData.firstName}-${formData.lastName}-img${i}-${Math.random()}.${fileExt}`;

                        // Compress the image before uploading
                        const options = {
                            maxSizeMB: 1, // Compress to max 1MB
                            maxWidthOrHeight: 1920,
                            useWebWorker: true
                        };
                        let fileToUpload = pic;
                        try {
                            // Only compress if it's an image
                            if (pic.type.startsWith('image/')) {
                                fileToUpload = await imageCompression(pic, options);
                            }
                        } catch (error) {
                            console.error("Compression error:", error);
                        }

                        const { error: uploadError } = await supabaseClient.storage
                            .from('profiles')
                            .upload(fileName, fileToUpload);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabaseClient.storage
                            .from('profiles')
                            .getPublicUrl(fileName);

                        return { index: i, url: publicUrl };
                    });

                    const uploadedProfiles = await Promise.all(profileUploadPromises);
                    uploadedProfiles.sort((a, b) => a.index - b.index);

                    if (uploadedProfiles.length > 0) {
                        mainImageUrl = uploadedProfiles[0].url;
                        galleryUrls = uploadedProfiles.slice(1).map(p => p.url);
                    }
                }

                // 2. Upload News Attachments Concurrently
                if (formData.newsHubInterest === "Yes" && newsAttachments.length > 0) {
                    try {
                        const newsUploadPromises = newsAttachments.map(async (attachment, i) => {
                            const fileExt = attachment.name.split('.').pop();
                            const fileName = `${formData.firstName}-${formData.lastName}-news-${i}-${Math.random()}.${fileExt}`;

                            let fileToUpload = attachment;
                            try {
                                // Compress if the attachment happens to be a massive image
                                if (attachment.type.startsWith('image/')) {
                                    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                                    fileToUpload = await imageCompression(attachment, options);
                                }
                            } catch (e) {
                                console.error(e);
                            }

                            const { error: uploadError } = await supabaseClient.storage
                                .from('news_articles') // Ensure this bucket exists in Supabase
                                .upload(fileName, fileToUpload);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabaseClient.storage
                                .from('news_articles')
                                .getPublicUrl(fileName);

                            return publicUrl;
                        });

                        newsArticleUrls = await Promise.all(newsUploadPromises);
                    } catch (attachmentError) {
                        console.error("Failed to process news attachments (bucket may be missing):", attachmentError);
                        // We intentionally don't throw here so the main form still submits successfully
                    }
                }

                // 3. Insert Database Record
                const { error: dbError } = await supabaseClient
                    .from('specialists')
                    .insert([
                        {
                            first_name: formData.firstName,
                            last_name: formData.lastName,
                            professional_title: formData.title,
                            professional_bio: formData.bio,
                            credentials: formData.credentials,
                            testimonial_1: formData.testimonial1,
                            testimonial_2: formData.testimonial2,
                            testimonial_3: formData.testimonial3,
                            clinic_name: formData.clinicName,
                            email_address: formData.email,
                            phone_number: formData.phone,
                            address: formData.address,
                            primary_category: formData.primaryCategory,
                            specific_title: formData.specificTitle,
                            specialization_tags: formData.specializationTags,
                            consultation_type: formData.consultationType,
                            accepting_new_clients: formData.acceptingClients === "Yes",
                            primary_testing_methods: formData.testingMethods,
                            profile_picture_url: mainImageUrl,
                            first_balance_result: formData.firstBalanceResult,
                            second_balance_result: formData.secondBalanceResult,
                            why_joined_tbn: formData.whyJoinedTBN,
                            other_blood_tests: formData.otherBloodTests,
                            gallery_image_urls: galleryUrls,
                            news_hub_article_interest: formData.newsHubInterest === "Yes",
                            news_article_urls: newsArticleUrls
                        }
                    ]);

                if (dbError) throw dbError;
            } else {
                console.warn("Supabase is not configured yet. Simulating success state.");
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            setSubmitStatus("success");
        } catch (error) {
            console.error(error);
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === "success") {
        return (
            <div className="text-center py-10 animate-[fadeIn_0.5s_ease-out_forwards]">
                <div className="w-20 h-20 mx-auto bg-[#F9F5F2] text-[var(--primary)] rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-[var(--primary)] mb-4">Application Submitted</h2>
                <p className="text-lg text-[var(--foreground)] opacity-80 mb-8 w-4/5 mx-auto">
                    Thank you for applying to the Test-Based Nutrition directory. Our team will review your profile shortly.
                </p>
                <button onClick={() => window.location.reload()} className="btn-primary">Submit Another</button>
            </div>
        );
    }

    // Helper component for word counts
    const WordCounter = ({ text, limit }: { text: string, limit: number }) => {
        const count = getWordCount(text);
        const isOver = count > limit;
        return (
            <div className={`text-xs mt-1 text-right font-medium ${isOver ? 'text-red-500' : 'text-[var(--primary)] opacity-80'}`}>
                {count} / {limit} words
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            {/* Progress Bar */}
            <div className="mb-10 flex justify-between items-center relative px-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--border)] w-full -z-10 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--primary)] -z-10 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((step - 1) / 5) * 100}%` }}
                ></div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= i ? "bg-[var(--primary)] text-white shadow-lg" : "bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--foreground)]"
                            }`}
                    >
                        {i}
                    </div>
                ))}
            </div>

            <div className="min-h-[450px]">
                {/* Step 1 */}
                {step === 1 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">1. Basic Information & Bio</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label">First Name *</label>
                                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="input-field" placeholder="e.g. Fiona" />
                                </div>
                                <div>
                                    <label className="input-label">Last Name *</label>
                                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="input-field" placeholder="e.g. Jayne" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="input-label">Professional Title *</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" placeholder="e.g. Nutritional Therapist" />
                                </div>
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    <span>Professional Bio *</span>
                                    <span className="text-xs font-normal opacity-70">(Max 100 words)</span>
                                </label>
                                <textarea
                                    required
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[140px] leading-relaxed ${getWordCount(formData.bio) > 100 ? '!border-red-500 !ring-red-500' : ''}`}
                                    placeholder="Tell us about yourself. E.g., Fiona is a registered Nutritional Therapist... She creates tailored test-based protocols..."
                                />
                                <WordCounter text={formData.bio} limit={100} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">2. Credentials & Expertise</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="input-label flex justify-between">
                                    <span>List your main credentials and expertise (Bullet Points style) *</span>
                                    <span className="text-xs font-normal opacity-70">(Max 50 words)</span>
                                </label>
                                <textarea
                                    required
                                    name="credentials"
                                    value={formData.credentials}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[160px] leading-relaxed ${getWordCount(formData.credentials) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="- Qualified Naturopathic Nutritionist - College of Naturopathic Medicine, London&#10;- Founder of FigTree Nutrition & Health&#10;- Specialist in Gut Health, Hormone Balance, and Fertility&#10;- Partner of Test-Based Nutrition for Advanced Health Testing"
                                />
                                <WordCounter text={formData.credentials} limit={50} />
                            </div>

                            <div className="bg-[var(--surface-hover)] p-5 rounded-xl border border-[var(--border)] mt-4">
                                <label className="input-label flex justify-between">
                                    <span>Part 2: My Omega Balance Test Result</span>
                                    <span className="text-xs opacity-60 font-normal">Optional</span>
                                </label>
                                <p className="text-sm opacity-70 mb-3">If you have taken a Test-Based Nutrition Omega Balance test, please share your resulting ratio.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium opacity-80 mb-2 block">1st Balance test result</label>
                                        <input
                                            type="text"
                                            name="firstBalanceResult"
                                            value={formData.firstBalanceResult}
                                            onChange={handleInputChange}
                                            className="input-field max-w-xs"
                                            placeholder="e.g. 15:1"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium opacity-80 mb-2 block">2nd balance test result</label>
                                        <input
                                            type="text"
                                            name="secondBalanceResult"
                                            value={formData.secondBalanceResult}
                                            onChange={handleInputChange}
                                            className="input-field max-w-xs"
                                            placeholder="e.g. 3:1"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium opacity-80 mb-2 block">Why I joined Test-Based Nutrition!</label>
                                        <textarea
                                            name="whyJoinedTBN"
                                            value={formData.whyJoinedTBN}
                                            onChange={handleInputChange}
                                            className={`input-field min-h-[100px] leading-relaxed ${getWordCount(formData.whyJoinedTBN) > 100 ? '!border-red-500' : ''}`}
                                            placeholder="E.g. Discovered the power of Omega-3 balance for my clients..."
                                        />
                                        <WordCounter text={formData.whyJoinedTBN} limit={100} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">3. Client Results & Testimonials</h2>
                        <p className="text-sm opacity-80 mb-6">Provide up to 3 powerful testimonials showcasing your results. (Max 50 words each)</p>

                        <div className="space-y-8">
                            <div>
                                <label className="input-label">Testimonial 1 *</label>
                                <textarea
                                    required
                                    name="testimonial1"
                                    value={formData.testimonial1}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[120px] leading-relaxed ${getWordCount(formData.testimonial1) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="&quot;Fiona has helped me regain control over my health...&quot;&#10;— Testimonial from a Client with Hashimoto's"
                                />
                                <WordCounter text={formData.testimonial1} limit={50} />
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    <span>Testimonial 2</span>
                                    <span className="text-xs opacity-60 font-normal">Optional</span>
                                </label>
                                <textarea
                                    name="testimonial2"
                                    value={formData.testimonial2}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[120px] leading-relaxed ${getWordCount(formData.testimonial2) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="&quot;I had been struggling with constant tiredness...&quot;&#10;— Testimonial from Fiona's Personal Experience"
                                />
                                <WordCounter text={formData.testimonial2} limit={50} />
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    <span>Testimonial 3</span>
                                    <span className="text-xs opacity-60 font-normal">Optional</span>
                                </label>
                                <textarea
                                    name="testimonial3"
                                    value={formData.testimonial3}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[120px] leading-relaxed ${getWordCount(formData.testimonial3) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="&quot;Fiona's personalised approach to nutrition helped me understand...&quot;&#10;— Testimonial from a Client with Gut Health Issues"
                                />
                                <WordCounter text={formData.testimonial3} limit={50} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">4. Contact Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="input-label">Title / Clinic Name</label>
                                <input type="text" name="clinicName" value={formData.clinicName} onChange={handleInputChange} className="input-field" placeholder="e.g. The FigTree" />
                            </div>
                            <div>
                                <label className="input-label">Email Address *</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="fionajayne@me.com" />
                            </div>
                            <div>
                                <label className="input-label">Phone Number *</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field" placeholder="07739 166897" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="input-label">Full Address *</label>
                                <textarea required name="address" value={formData.address} onChange={handleInputChange} className="input-field min-h-[80px]" placeholder="35 Percy Road, Leigh-On-Sea, England, SS9 2LA" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">5. Categories & Testing Methods</h2>
                        <div className="space-y-8">

                            {/* CATEGORY & TITLE SELECTION */}
                            <div className="bg-[var(--surface-hover)] p-6 rounded-xl border border-[var(--border)]">
                                <h3 className="text-xl font-semibold text-[var(--primary)] mb-4">Professional Classification</h3>

                                <div className="mb-6">
                                    <label className="input-label">Primary Category *</label>
                                    <select
                                        name="primaryCategory"
                                        value={formData.primaryCategory}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select your professional category...</option>
                                        <option value="Medical & Clinical Specialists">1. Medical & Clinical Specialists</option>
                                        <option value="Allied Health & Clinical Practitioners">2. Allied Health & Clinical Practitioners</option>
                                        <option value="Functional, Preventative & Holistic Health">3. Functional, Preventative & Holistic Health</option>
                                        <option value="Health, Lifestyle, Mindset & Beauty">4. Health, Lifestyle, Mindset & Beauty</option>
                                        <option value="Mental Health & Neuro-Specialists">5. Mental Health & Neuro-Specialists</option>
                                        <option value="Sports Performance & Rehabilitation">6. Sports Performance & Rehabilitation</option>
                                    </select>
                                </div>

                                {formData.primaryCategory && (
                                    <div className="animate-[fadeIn_0.3s_ease-out]">
                                        <label className="input-label">Specific Title *</label>
                                        <select
                                            name="specificTitle"
                                            value={formData.specificTitle}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select your specific title...</option>

                                            {/* 1. Medical */}
                                            {formData.primaryCategory === "Medical & Clinical Specialists" && (
                                                <>
                                                    <optgroup label="Primary Care">
                                                        <option value="General Practitioner (GP)">General Practitioner (GP)</option>
                                                        <option value="Family Medicine">Family Medicine</option>
                                                    </optgroup>
                                                    <optgroup label="Specialist Medicine">
                                                        <option value="Endocrinologist">Endocrinologist</option>
                                                        <option value="Gastroenterologist">Gastroenterologist</option>
                                                        <option value="Neurologist">Neurologist</option>
                                                        <option value="Psychiatrist">Psychiatrist</option>
                                                        <option value="Cardiologist">Cardiologist</option>
                                                        <option value="Dermatologist">Dermatologist</option>
                                                        <option value="Orthopaedic Doctor">Orthopaedic Doctor</option>
                                                        <option value="Paediatric Doctor">Paediatric Doctor</option>
                                                    </optgroup>
                                                    <optgroup label="Longevity & Integrative">
                                                        <option value="Longevity Medicine Doctor">Longevity Medicine Doctor</option>
                                                        <option value="Functional Medicine Doctor">Functional Medicine Doctor</option>
                                                        <option value="Integrative Medicine Doctor">Integrative Medicine Doctor</option>
                                                        <option value="Lifestyle Medicine Doctor">Lifestyle Medicine Doctor</option>
                                                    </optgroup>
                                                    <optgroup label="Reproductive Health">
                                                        <option value="Women's Health Doctor">Women's Health Doctor</option>
                                                        <option value="Menopause Specialist Doctor">Menopause Specialist Doctor</option>
                                                        <option value="Fertility Specialist">Fertility Specialist</option>
                                                    </optgroup>
                                                </>
                                            )}

                                            {/* 2. Allied Health */}
                                            {formData.primaryCategory === "Allied Health & Clinical Practitioners" && (
                                                <>
                                                    <optgroup label="Physical Therapy">
                                                        <option value="Physiotherapist">Physiotherapist</option>
                                                        <option value="Osteopath">Osteopath</option>
                                                        <option value="Chiropractor">Chiropractor</option>
                                                        <option value="Podiatrist">Podiatrist</option>
                                                    </optgroup>
                                                    <optgroup label="Diet & Nutrition">
                                                        <option value="Registered Dietitian">Registered Dietitian</option>
                                                        <option value="Registered Nutritionist">Registered Nutritionist</option>
                                                    </optgroup>
                                                    <optgroup label="Clinical Support">
                                                        <option value="Occupational Therapist">Occupational Therapist</option>
                                                        <option value="Speech & Language Therapist">Speech & Language Therapist</option>
                                                        <option value="Radiographer">Radiographer</option>
                                                        <option value="Paramedic">Paramedic</option>
                                                        <option value="Prosthetist / Orthotist">Prosthetist / Orthotist</option>
                                                    </optgroup>
                                                </>
                                            )}

                                            {/* 3. Functional */}
                                            {formData.primaryCategory === "Functional, Preventative & Holistic Health" && (
                                                <>
                                                    <optgroup label="Functional Specialists">
                                                        <option value="Functional Medicine Practitioner">Functional Medicine Practitioner</option>
                                                        <option value="Functional Nutrition Practitioner">Functional Nutrition Practitioner</option>
                                                        <option value="Nutritional Therapist">Nutritional Therapist</option>
                                                        <option value="Integrative Health Practitioner">Integrative Health Practitioner</option>
                                                    </optgroup>
                                                    <optgroup label="Longevity & Prevention">
                                                        <option value="Longevity Practitioner">Longevity Practitioner</option>
                                                        <option value="Preventative Health Practitioner">Preventative Health Practitioner</option>
                                                        <option value="Cellular Health Specialist">Cellular Health Specialist</option>
                                                    </optgroup>
                                                    <optgroup label="Traditional & Natural">
                                                        <option value="Naturopath">Naturopath</option>
                                                        <option value="Herbalist">Herbalist</option>
                                                        <option value="Ayurvedic Practitioner">Ayurvedic Practitioner</option>
                                                        <option value="Traditional Chinese Medicine (TCM)">Traditional Chinese Medicine (TCM)</option>
                                                        <option value="Holistic Health Practitioner">Holistic Health Practitioner</option>
                                                    </optgroup>
                                                    <optgroup label="Body & Energy Work">
                                                        <option value="Massage Therapist">Massage Therapist</option>
                                                        <option value="Myofascial Therapist">Myofascial Therapist</option>
                                                        <option value="Lymphatic Drainage Therapist">Lymphatic Drainage Therapist</option>
                                                        <option value="Reflexologist">Reflexologist</option>
                                                        <option value="Acupuncturist">Acupuncturist</option>
                                                        <option value="Reiki Practitioner">Reiki Practitioner</option>
                                                    </optgroup>
                                                </>
                                            )}

                                            {/* 4. Coaching */}
                                            {formData.primaryCategory === "Health, Lifestyle, Mindset & Beauty" && (
                                                <>
                                                    <optgroup label="Foundational Coaching">
                                                        <option value="Health Coach">Health Coach</option>
                                                        <option value="Wellness Coach">Wellness Coach</option>
                                                        <option value="Lifestyle Coach">Lifestyle Coach</option>
                                                        <option value="Aesthetician">Aesthetician</option>
                                                        <option value="Beautician">Beautician</option>
                                                        <option value="TBN Trained Specialist">TBN Trained Specialist</option>
                                                    </optgroup>
                                                    <optgroup label="Targeted Coaching">
                                                        <option value="Nutrition Coach">Nutrition Coach</option>
                                                        <option value="Weight Loss Coach">Weight Loss Coach</option>
                                                        <option value="Sleep Coach">Sleep Coach</option>
                                                        <option value="Stress Management Coach">Stress Management Coach</option>
                                                    </optgroup>
                                                    <optgroup label="Performance & Growth">
                                                        <option value="Mindset Coach">Mindset Coach</option>
                                                        <option value="Behaviour Change Coach">Behaviour Change Coach</option>
                                                        <option value="Performance Coach">Performance Coach</option>
                                                        <option value="Longevity Coach">Longevity Coach</option>
                                                    </optgroup>
                                                </>
                                            )}

                                            {/* 5. Mental Health */}
                                            {formData.primaryCategory === "Mental Health & Neuro-Specialists" && (
                                                <>
                                                    <optgroup label="Clinical Psychology">
                                                        <option value="Psychologist">Psychologist</option>
                                                        <option value="Clinical Psychologist">Clinical Psychologist</option>
                                                        <option value="Neuropsychologist">Neuropsychologist</option>
                                                        <option value="Psychotherapist">Psychotherapist</option>
                                                    </optgroup>
                                                    <optgroup label="Therapy & Counseling">
                                                        <option value="CBT Therapist">CBT Therapist</option>
                                                        <option value="Counsellor">Counsellor</option>
                                                        <option value="Trauma Therapist">Trauma Therapist</option>
                                                    </optgroup>
                                                    <optgroup label="Neuro-Focus">
                                                        <option value="ADHD Specialist">ADHD Specialist</option>
                                                        <option value="Neurodivergence Specialist">Neurodivergence Specialist</option>
                                                        <option value="Neurodivergent Family Specialist">Neurodivergent Family Specialist</option>
                                                    </optgroup>
                                                </>
                                            )}

                                            {/* 6. Sports */}
                                            {formData.primaryCategory === "Sports Performance & Rehabilitation" && (
                                                <>
                                                    <optgroup label="Performance Science">
                                                        <option value="Sports Scientist">Sports Scientist</option>
                                                        <option value="Biomechanics Specialist">Biomechanics Specialist</option>
                                                        <option value="Sports Nutritionist">Sports Nutritionist</option>
                                                    </optgroup>
                                                    <optgroup label="Training & Strength">
                                                        <option value="Strength & Conditioning Coach">Strength & Conditioning Coach</option>
                                                        <option value="Personal Trainer">Personal Trainer</option>
                                                        <option value="Athletic Trainer">Athletic Trainer</option>
                                                    </optgroup>
                                                    <optgroup label="Recovery & Rehab">
                                                        <option value="Sports Therapist">Sports Therapist</option>
                                                        <option value="Recovery Specialist">Recovery Specialist</option>
                                                        <option value="Rehabilitation Specialist">Rehabilitation Specialist</option>
                                                    </optgroup>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* SPECIALIZATION TAGS */}
                            {formData.primaryCategory && (
                                <div className="animate-[fadeIn_0.4s_ease-out]">
                                    <label className="input-label mb-5 mt-8 text-[var(--primary)] font-semibold text-xl border-b border-[var(--border)] pb-2 flex justify-between items-center">
                                        <span>TBN Focus Tags</span>
                                        <span className="text-sm font-normal text-[var(--foreground)] opacity-70 ml-2">(Select all that apply)</span>
                                    </label>

                                    <div className="space-y-8 mb-8">
                                        {/* Women's Health */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Women's Health</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                {["Puberty & Teen Hormones", "Fertility & Conception", "Pregnancy & Postnatal Health", "Perimenopause", "Menopause", "Hormonal Conditions", "Mood, Brain Fog & Hormonal Health", "Gut Health"].map(tag => (
                                                    <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Men's Health */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Men's Health</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                {["Teen & Young Men’s Hormones", "Testosterone & Hormonal Health", "Male Fertility", "Metabolic Health & Weight", "Stress, Mood & Burnout", "Healthy Ageing for Men", "Gut Health"].map(tag => (
                                                    <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Children's Health */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Children's Health</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                {["Early Childhood Development", "Gut Health in Children", "Neurodivergent Children (ADHD & Focus)", "Immunity, Growth & Development", "Teen Health & Hormones", "Emotional Wellbeing & Behaviour"].map(tag => (
                                                    <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Neurodivergence */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Neurodivergence</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                {["ADHD in Children", "Neurodivergent Teens", "ADHD in Women", "ADHD in Adults", "Focus, Brain Fog & Cognitive Health", "Gut Health & Neurodivergence"].map(tag => (
                                                    <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Skin Health */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Skin Health</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                {["Acne & Teen Skin", "Hormonal Skin", "Chronic Skin Conditions", "Skin & Gut Health", "Skin Ageing & Collagen Health", "Perimenopause Skin"].map(tag => (
                                                    <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sports Performance */}
                                        <div>
                                            <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Sports Performance</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                                {["Youth Performance", "Athletes (Amateur to Elite)", "Event & Competition Preparation", "Coaches & Performance Teams", "Peak Performance & Longevity"].map(tag => (
                                                    <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TESTING METHODS */}

                            <div>
                                <label className="input-label mb-3 text-[var(--primary)] font-semibold text-lg border-b border-[var(--border)] pb-2">1. Foundational Health Testing (TBN)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                    {[
                                        "Finger Prick Balance Testing (Omega 6:3)",
                                        "Finger Prick Gut Health Testing"
                                    ].map((method) => (
                                        <label key={method} className="custom-checkbox bg-[var(--surface-hover)] p-3 rounded-lg border border-[var(--primary-light)] border-opacity-30 hover:border-opacity-100 transition-all">
                                            <input type="checkbox" checked={formData.testingMethods.includes(method)} onChange={() => handleCheckboxChange("testingMethods", method)} />
                                            <span className="checkmark min-w-[20px]"></span>
                                            <span className="text-sm font-medium text-[var(--primary)]">{method}</span>
                                        </label>
                                    ))}
                                </div>

                                <label className="input-label mb-3 text-[var(--primary)] font-semibold text-lg border-b border-[var(--border)] pb-2">2. 15-Minute Point of Care Testing</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2">
                                    {[
                                        "Vitamin D Levels (FP)",
                                        "HbA1c - Diabetes (FP)",
                                        "hS-CRP Heart Screening (FP)",
                                        "CRP Inflammation (FP)",
                                        "RF Rheumatoid Screening (FP)",
                                        "Cortisol Stress Hormone (FP)",
                                        "Ferritin Iron Levels (FP)",
                                        "Cystatin C Kidney Screening (FP)",
                                        "HCG+B Pregnancy Indication (FP)",
                                        "AMH Ovarian Reserve (FP)",
                                        "Progesterone Ovulation (FP)",
                                        "Folate (FP)",
                                        "NT-proBNP Heart Monitoring (VBD)",
                                        "TSH Thyroid Screening (VBD)",
                                        "FSH Menopause (VBD)",
                                        "Vitamin B12 Levels (VBD+C)",
                                        "Testosterone (VBD+C)",
                                        "RSV/Influenza A/B (NS)"
                                    ].map((method) => (
                                        <label key={method} className="custom-checkbox">
                                            <input type="checkbox" checked={formData.testingMethods.includes(method)} onChange={() => handleCheckboxChange("testingMethods", method)} />
                                            <span className="checkmark min-w-[20px]"></span>
                                            <span className="text-xs whitespace-nowrap overflow-hidden text-ellipsis mr-2" title={method}>{method}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-8 bg-[var(--surface-hover)] p-5 rounded-xl border border-[var(--border)] mt-4">
                                    <label className="input-label flex justify-between">
                                        <span>3. Any other Blood tests</span>
                                        <span className="text-xs opacity-60 font-normal">Optional</span>
                                    </label>
                                    <p className="text-sm opacity-70 mb-3">Please list any other relevant blood tests you frequently run.</p>
                                    <textarea
                                        name="otherBloodTests"
                                        value={formData.otherBloodTests}
                                        onChange={handleInputChange}
                                        className="input-field min-h-[80px]"
                                        placeholder="e.g. Full Thyroid Panel, Autoimmune Screen..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6 */}
                {step === 6 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">6. Media & Contributions</h2>
                        <div className="space-y-10">
                            <div>
                                <label className="input-label mb-2">Profile & Gallery Images *</label>
                                <p className="text-sm opacity-70 mb-4">Upload a professional headshot and up to 3 gallery images of your clinic or practice. First image will be your main profile photo. (Max 5MB each)</p>

                                <div className="file-upload-wrapper">
                                    <input required={profilePics.length === 0} type="file" accept="image/*" multiple onChange={handleFileChange} className="file-upload-input" />
                                    <div className="text-[var(--primary)] mb-2">
                                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    </div>
                                    <span className="font-medium text-[var(--foreground)] mt-2 text-center text-sm px-4 break-words">
                                        {profilePics.length > 0 ? profilePics.map(f => f.name).join(", ") : "Drag & drop or click to upload multiple images"}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[var(--surface-hover)] p-6 rounded-xl border border-[var(--border)]">
                                <h3 className="text-[var(--primary)] text-lg font-semibold mb-2">News Hub Contributions</h3>
                                <p className="text-sm opacity-70 mb-4 leading-relaxed">Would you be interested in submitting articles to the Test-Based Nutrition News Hub? <br />(Published articles will link directly back to your microsite profile!)</p>

                                <div className="flex gap-6">
                                    <label className="custom-checkbox items-center !mb-0">
                                        <input type="radio" name="newsHubInterest" value="Yes" checked={formData.newsHubInterest === "Yes"} onChange={handleInputChange} />
                                        <span className="checkmark min-w-[20px] !rounded-full"></span>
                                        <span className="ml-2 font-medium">Yes, I'm interested</span>
                                    </label>
                                    <label className="custom-checkbox items-center !mb-0">
                                        <input type="radio" name="newsHubInterest" value="No" checked={formData.newsHubInterest === "No"} onChange={handleInputChange} />
                                        <span className="checkmark min-w-[20px] !rounded-full"></span>
                                        <span className="ml-2 font-medium">No, not right now</span>
                                    </label>
                                </div>

                                {formData.newsHubInterest === "Yes" && (
                                    <div className="mt-6 animate-[fadeIn_0.3s_ease-out]">
                                        <label className="input-label mb-2">Attach News Articles (Optional)</label>
                                        <p className="text-sm opacity-70 mb-4">You can upload Word documents, PDFs, or images. (Maximum size: 5MB per file)</p>

                                        <div className="file-upload-wrapper">
                                            <input type="file" accept=".pdf,.doc,.docx,image/*" multiple onChange={handleNewsAttachmentChange} className="file-upload-input" />
                                            <div className="text-[var(--primary)] mb-2">
                                                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                            </div>
                                            <span className="font-medium text-[var(--foreground)] mt-2 text-center text-sm px-4 break-words">
                                                {newsAttachments.length > 0 ? newsAttachments.map(f => f.name).join(", ") : "Drag & drop or click to upload multiple attachments"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {submitStatus === "error" && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                                    There was an error saving your submission. Please check your Supabase configuration and try again.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 flex justify-between border-t border-[var(--border)] pt-6">
                {step > 1 ? (
                    <button type="button" onClick={prevStep} className="px-6 py-3 font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                        Back
                    </button>
                ) : <div></div>}

                <button
                    type="submit"
                    disabled={isSubmitting || !canProceed()}
                    className="btn-primary"
                >
                    {step === 6
                        ? (isSubmitting ? "Submitting..." : "Complete Registration")
                        : "Continue →"}
                </button>
            </div>

            <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </form>
    );
}
