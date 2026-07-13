"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from 'browser-image-compression';

export default function AmbassadorRegistrationForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

    const [qualifications, setQualifications] = useState<string[]>([""]);

    const updateQualifications = (newList: string[]) => {
        setQualifications(newList);
        setFormData(prev => ({
            ...prev,
            credentials: newList.filter(q => q.trim().length > 0).join("; ")
        }));
    };

    const handleQualificationChange = (index: number, value: string) => {
        const newList = [...qualifications];
        newList[index] = value;
        updateQualifications(newList);
    };

    const addQualificationField = () => {
        if (qualifications.length < 15) {
            updateQualifications([...qualifications, ""]);
        }
    };

    const removeQualificationField = (index: number) => {
        if (qualifications.length > 1) {
            const newList = qualifications.filter((_, i) => i !== index);
            updateQualifications(newList);
        } else {
            updateQualifications([""]);
        }
    };

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        title: "",
        bio: "",
        credentials: "",
        testimonial1: "",
        testimonial2: "",
        testimonial3: "",
        clinicName: "", // Acts as Affiliated Team / Org / Sport
        email: "",
        phone: "",
        address: "", // Acts as Location / Region
        specializationTags: [] as string[],
        newsHubInterest: "No",
        firstBalanceResult: "",
        secondBalanceResult: "",
        whyJoinedTBN: "",
        whyPartneredTBN: "",
        otherBloodTests: "",
        experience: "",
    });

    const [profilePic, setProfilePic] = useState<File | null>(null);
    const [galleryPics, setGalleryPics] = useState<File[]>([]);
    const [newsAttachments, setNewsAttachments] = useState<File[]>([]);

    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (category: "specializationTags", value: string) => {
        setFormData((prev) => {
            const currentList = prev[category] as string[];
            if (currentList.includes(value)) {
                return { ...prev, [category]: currentList.filter((item) => item !== value) };
            }
            return { ...prev, [category]: [...currentList, value] };
        });
    };

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const maxSizeMB = 5;

            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`The profile image was too large. Please ensure your picture is under ${maxSizeMB}MB.`);
                return;
            }

            setProfilePic(file);
        }
    };

    const handleGalleryPicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                alert(`Some gallery images were too large and skipped. Please ensure your pictures are under ${maxSizeMB}MB.`);
            }

            const combined = [...galleryPics, ...validFiles].slice(0, 10);
            if (galleryPics.length + validFiles.length > 10) {
                alert("You can upload a maximum of 10 gallery images. Only the first 10 selected images have been kept.");
            }
            setGalleryPics(combined);
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
    const isStep1Valid = formData.firstName && formData.lastName && formData.title && formData.bio && formData.experience && getWordCount(formData.bio) <= 100;
    const isStep2Valid = formData.credentials 
        && getWordCount(formData.credentials) <= 50
        && getWordCount(formData.whyJoinedTBN) <= 50
        && getWordCount(formData.whyPartneredTBN) <= 50;
    const isStep3Valid = formData.testimonial1 && getWordCount(formData.testimonial1) <= 50
        && getWordCount(formData.testimonial2) <= 50
        && getWordCount(formData.testimonial3) <= 50;
    const isStep4Valid = formData.email && formData.address;

    const canProceed = () => {
        if (step === 1) return isStep1Valid;
        if (step === 2) return isStep2Valid;
        if (step === 3) return isStep3Valid;
        if (step === 4) return isStep4Valid;
        if (step === 5) return true;
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
                // 1. Upload Profile Pic
                if (profilePic) {
                    const fileExt = profilePic.name.split('.').pop();
                    const fileName = `${formData.firstName}-${formData.lastName}-profile-${Math.random()}.${fileExt}`;

                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    };
                    let fileToUpload = profilePic;
                    try {
                        if (profilePic.type.startsWith('image/')) {
                            fileToUpload = await imageCompression(profilePic, options);
                        }
                    } catch (error) {
                        console.error("Profile pic compression error:", error);
                    }

                    const { error: uploadError } = await supabaseClient.storage
                        .from('profiles')
                        .upload(fileName, fileToUpload);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabaseClient.storage
                        .from('profiles')
                        .getPublicUrl(fileName);

                    mainImageUrl = publicUrl;
                }

                // 2. Upload Gallery Pics Concurrently
                if (galleryPics.length > 0) {
                    const galleryUploadPromises = galleryPics.map(async (pic, i) => {
                        const fileExt = pic.name.split('.').pop();
                        const fileName = `${formData.firstName}-${formData.lastName}-gallery-${i}-${Math.random()}.${fileExt}`;

                        const options = {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1920,
                            useWebWorker: true
                        };
                        let fileToUpload = pic;
                        try {
                            if (pic.type.startsWith('image/')) {
                                fileToUpload = await imageCompression(pic, options);
                            }
                        } catch (error) {
                            console.error("Gallery pic compression error:", error);
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

                    const uploadedGallery = await Promise.all(galleryUploadPromises);
                    uploadedGallery.sort((a, b) => a.index - b.index);
                    galleryUrls = uploadedGallery.map(g => g.url);
                }

                // 3. Upload News Attachments Concurrently
                if (formData.newsHubInterest === "Yes" && newsAttachments.length > 0) {
                    try {
                        const newsUploadPromises = newsAttachments.map(async (attachment, i) => {
                            const fileExt = attachment.name.split('.').pop();
                            const fileName = `${formData.firstName}-${formData.lastName}-news-${i}-${Math.random()}.${fileExt}`;

                            let fileToUpload = attachment;
                            try {
                                if (attachment.type.startsWith('image/')) {
                                    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                                    fileToUpload = await imageCompression(attachment, options);
                                }
                            } catch (e) {
                                console.error(e);
                            }

                            const { error: uploadError } = await supabaseClient.storage
                                .from('news_articles')
                                .upload(fileName, fileToUpload);

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabaseClient.storage
                                .from('news_articles')
                                .getPublicUrl(fileName);

                            return publicUrl;
                        });

                        newsArticleUrls = await Promise.all(newsUploadPromises);
                    } catch (attachmentError) {
                        console.error("Failed to process news attachments:", attachmentError);
                    }
                }

                // 4. Insert Database Record with Hardcoded Ambassador classification
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
                            clinic_name: formData.clinicName || null,
                            email_address: formData.email,
                            phone_number: formData.phone,
                            address: formData.address,
                            primary_category: "TBN Brand Ambassador", // Sets classification automatically
                            specific_title: formData.title, // Maps athletic title to specific title
                            specialization_tags: formData.specializationTags,
                            consultation_type: "Both",
                            accepting_new_clients: true,
                            primary_testing_methods: [],
                            profile_picture_url: mainImageUrl,
                            first_balance_result: formData.firstBalanceResult || null,
                            second_balance_result: formData.secondBalanceResult || null,
                            why_joined_tbn: formData.whyJoinedTBN || null,
                            why_partnered_tbn: formData.whyPartneredTBN || null,
                            other_blood_tests: formData.otherBloodTests || null,
                            gallery_image_urls: galleryUrls,
                            news_hub_article_interest: formData.newsHubInterest === "Yes",
                            news_article_urls: newsArticleUrls,
                            experience: formData.experience
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
                    Thank you for applying to the Test-Based Nutrition Brand Ambassador directory. Our team will review your profile shortly.
                </p>
                <button onClick={() => window.location.reload()} className="btn-primary">Submit Another</button>
            </div>
        );
    }

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
                        <h2 className="form-section-title">1. Basic Ambassador Info & Biography</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label">First Name *</label>
                                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="input-field" placeholder="First Name" />
                                </div>
                                <div>
                                    <label className="input-label">Last Name *</label>
                                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="input-field" placeholder="Last Name" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="input-label">Athletic / Ambassador Title *</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" placeholder="e.g. Professional Boxer / Olympic Skier / Longevity Coach" />
                                </div>
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    <span>Ambassador Bio *</span>
                                    <span className="text-xs font-normal opacity-70">(Max 100 words)</span>
                                </label>
                                <textarea
                                    required
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[140px] leading-relaxed ${getWordCount(formData.bio) > 100 ? '!border-red-500 !ring-red-500' : ''}`}
                                    placeholder="Tell us about yourself. E.g., Sonny is a professional boxer who uses test-based cellular nutrition to accelerate his recovery..."
                                />
                                <WordCounter text={formData.bio} limit={100} />
                            </div>

                            <div>
                                <label className="input-label">Years of Career / Experience *</label>
                                <select
                                    required
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="">Select duration...</option>
                                    {["1", "2", "3", "4", "5", "5+", "10+", "20+"].map(val => (
                                        <option key={val} value={val}>
                                            {val} {val === "1" ? "Year" : "Years"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">2. Achievements & Omega Balance Journey</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="input-label flex justify-between">
                                    <span>List your main achievements and credentials *</span>
                                    <span className="text-xs font-normal opacity-70">(Max 50 words total)</span>
                                </label>
                                <div className="space-y-3">
                                    {qualifications.map((qual, index) => (
                                        <div key={index} className="flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
                                            <span className="text-sm font-semibold text-[var(--primary)] opacity-70 w-6">
                                                {index + 1}.
                                            </span>
                                            <input
                                                type="text"
                                                required={index === 0}
                                                value={qual}
                                                onChange={(e) => handleQualificationChange(index, e.target.value)}
                                                className={`input-field ${getWordCount(formData.credentials) > 50 ? '!border-red-500 !ring-red-500' : ''}`}
                                                placeholder={index === 0 ? "e.g. Professional Boxing Record 6-0 (3 KOs)" : "Add another achievement"}
                                            />
                                            {qualifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQualificationField(index)}
                                                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200 shrink-0"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={addQualificationField}
                                        disabled={qualifications.length >= 15}
                                        className="text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--primary-light)] border-opacity-30 hover:border-opacity-100 bg-[var(--surface-hover)]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add another achievement
                                    </button>
                                    <WordCounter text={formData.credentials} limit={50} />
                                </div>
                            </div>

                            <div className="bg-[var(--surface-hover)] p-5 rounded-xl border border-[var(--border)] mt-4">
                                <label className="input-label flex justify-between">
                                    <span>My Omega Balance Test Result</span>
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
                                            placeholder="e.g. 18:1"
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
                                        <label className="text-sm font-medium opacity-80 mb-2 block">My Personal Test-Based Omega Balance Journey</label>
                                        <textarea
                                            name="whyJoinedTBN"
                                            value={formData.whyJoinedTBN}
                                            onChange={handleInputChange}
                                            className={`input-field min-h-[100px] leading-relaxed ${getWordCount(formData.whyJoinedTBN) > 50 ? '!border-red-500' : ''}`}
                                            placeholder="E.g. My Omega 6:3 ratio drastically shifted from 18:1 to a balanced 3:1, enhancing my recovery, sleep and reducing joint stiffness..."
                                        />
                                        <WordCounter text={formData.whyJoinedTBN} limit={50} />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium opacity-80 mb-2 block">Why I represent / partnered with TBN</label>
                                        <textarea
                                            name="whyPartneredTBN"
                                            value={formData.whyPartneredTBN}
                                            onChange={handleInputChange}
                                            className={`input-field min-h-[100px] leading-relaxed ${getWordCount(formData.whyPartneredTBN) > 50 ? '!border-red-500' : ''}`}
                                            placeholder="Explain why you chose to represent Test-Based Nutrition..."
                                        />
                                        <WordCounter text={formData.whyPartneredTBN} limit={50} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">3. Highlights & Key Quotes</h2>
                        <p className="text-sm opacity-80 mb-6">Provide up to 3 powerful highlights, endorsements, or quotes. (Max 50 words each)</p>

                        <div className="space-y-8">
                            <div>
                                <label className="input-label">Quote / Highlight 1 *</label>
                                <textarea
                                    required
                                    name="testimonial1"
                                    value={formData.testimonial1}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[120px] leading-relaxed ${getWordCount(formData.testimonial1) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="&quot;TBN has been a game-changer for my training. Balance testing provides objective data to help me stay at peak performance.&quot;"
                                />
                                <WordCounter text={formData.testimonial1} limit={50} />
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    <span>Quote / Highlight 2</span>
                                    <span className="text-xs opacity-60 font-normal">Optional</span>
                                </label>
                                <textarea
                                    name="testimonial2"
                                    value={formData.testimonial2}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[120px] leading-relaxed ${getWordCount(formData.testimonial2) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="Add another quote or endorsement..."
                                />
                                <WordCounter text={formData.testimonial2} limit={50} />
                            </div>

                            <div>
                                <label className="input-label flex justify-between">
                                    <span>Quote / Highlight 3</span>
                                    <span className="text-xs opacity-60 font-normal">Optional</span>
                                </label>
                                <textarea
                                    name="testimonial3"
                                    value={formData.testimonial3}
                                    onChange={handleInputChange}
                                    className={`input-field min-h-[120px] leading-relaxed ${getWordCount(formData.testimonial3) > 50 ? '!border-red-500' : ''}`}
                                    placeholder="Add a third quote or endorsement..."
                                />
                                <WordCounter text={formData.testimonial3} limit={50} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">4. Representation & Contact Info</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="input-label">Affiliation / Sport / Team / Sponsor</label>
                                <input type="text" name="clinicName" value={formData.clinicName} onChange={handleInputChange} className="input-field" placeholder="e.g. RJ's Boxing Gym / Team GB" />
                            </div>
                            <div>
                                <label className="input-label">Email Address *</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" placeholder="Email" />
                            </div>
                            <div>
                                <label className="input-label">Phone Number *</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field" placeholder="Tel" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="input-label">Location / Region *</label>
                                <textarea required name="address" value={formData.address} onChange={handleInputChange} className="input-field min-h-[80px]" placeholder="e.g. Essex, London / Manchester" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">5. Ambassadorship Focus Areas</h2>
                        <div className="space-y-8">
                            <div className="animate-[fadeIn_0.4s_ease-out]">
                                <label className="input-label mb-5 text-[var(--primary)] font-semibold text-xl border-b border-[var(--border)] pb-2 flex justify-between items-center">
                                    <span>TBN Ambassadorship Themes</span>
                                    <span className="text-sm font-normal text-[var(--foreground)] opacity-70 ml-2">(Select all that apply)</span>
                                </label>

                                <div className="space-y-8 mb-8">
                                    {/* Sports Performance */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Sports Performance & Longevity</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                            {["Youth Performance", "Athletes (Amateur to Elite)", "Event & Competition Preparation", "Coaches & Performance Teams", "Peak Performance & Longevity"].map(tag => (
                                                <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Men's Health */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Men's Health</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                            {["Teen & Young Men’s Hormones", "Testosterone & Hormonal Health", "Healthy Ageing for Men", "Stress, Mood & Burnout", "Gut Health"].map(tag => (
                                                <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Women's Health */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Women's Health</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                            {["Pregnancy & Postnatal Health", "Perimenopause", "Menopause", "Hormonal Conditions", "Mood, Brain Fog & Hormonal Health", "Gut Health"].map(tag => (
                                                <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skin & Fatigue */}
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 text-[var(--primary)] uppercase tracking-wider">Skin, Fatigue & Children's Health</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                            {["Acne & Teen Skin", "Skin Ageing & Collagen Health", "Gut Health & Neurodivergence", "Neurodivergent Children (ADHD & Focus)", "Immunity, Growth & Development"].map(tag => (
                                                <label key={tag} className="custom-checkbox"><input type="checkbox" checked={formData.specializationTags.includes(tag)} onChange={() => handleCheckboxChange("specializationTags", tag)} /><span className="checkmark min-w-[20px]"></span><span className="text-sm">{tag}</span></label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6 */}
                {step === 6 && (
                    <div className="animate-[fadeSlideUp_0.4s_ease-out]">
                        <h2 className="form-section-title">6. Profile Media Uploads</h2>
                        <div className="space-y-8">
                            {/* Profile Picture Upload */}
                            <div>
                                <label className="input-label mb-1 font-semibold text-lg text-[var(--primary)]">Headshot / Profile Photo *</label>
                                <p className="text-sm opacity-70 mb-3">Upload your main headshot or profile photo. (Max 5MB)</p>

                                {profilePic ? (
                                    <div className="flex items-center gap-4 p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--primary)] border-opacity-30 animate-[fadeIn_0.2s_ease-out]">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                                            <img
                                                src={URL.createObjectURL(profilePic)}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <span className="font-semibold text-sm block truncate text-[var(--foreground)]">{profilePic.name}</span>
                                            <span className="text-xs text-[var(--foreground)] opacity-60">{(profilePic.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setProfilePic(null)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                            title="Remove photo"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="file-upload-wrapper">
                                        <input required type="file" accept="image/*" onChange={handleProfilePicChange} className="file-upload-input" />
                                        <div className="text-[var(--primary)] mb-2">
                                            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <span className="font-medium text-[var(--foreground)] mt-2 text-center text-sm px-4">
                                            Drag & drop or click to upload your profile photo
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Images Upload */}
                            <div>
                                <label className="input-label mb-1 font-semibold text-lg text-[var(--primary)]">Gallery Images</label>
                                <p className="text-sm opacity-70 mb-3">Upload up to 10 photos of training, competing, speaking or events. (Max 5MB each)</p>

                                <div className="file-upload-wrapper mb-4">
                                    <input type="file" accept="image/*" multiple onChange={handleGalleryPicsChange} className="file-upload-input" />
                                    <div className="text-[var(--primary)] mb-2">
                                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <span className="font-medium text-[var(--foreground)] mt-2 text-center text-sm px-4">
                                        Drag & drop or click to upload gallery images (select multiple)
                                    </span>
                                </div>

                                {galleryPics.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-[fadeIn_0.2s_ease-out]">
                                        {galleryPics.map((pic, idx) => (
                                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-zinc-100">
                                                <img
                                                    src={URL.createObjectURL(pic)}
                                                    alt={`Gallery Preview ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setGalleryPics(prev => prev.filter((_, i) => i !== idx))}
                                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md"
                                                        title="Remove image"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {submitStatus === "error" && (
                            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                                There was an error saving your submission. Please check your Supabase configuration and try again.
                            </div>
                        )}
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
