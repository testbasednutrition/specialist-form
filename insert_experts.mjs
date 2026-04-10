import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yfnwzfznjrwqxujssesx.supabase.co';
const supabaseKey = 'sb_publishable_zAV7rgojrLV0GYeGUgqIWw_aKVsXwcY';

const supabase = createClient(supabaseUrl, supabaseKey);

const expertsToAdd = [
  {
    first_name: "Ishtiaq",
    last_name: "Rehman",
    professional_title: "Consulting Doctor - England FA",
    professional_bio: "Dr. Ishtiaq Rehman is a renowned figure in the field of sports medicine, with a career that spans consulting for elite organisations such as the England FA and Sunderland FC. His passion for performance optimisation has led him to become a Partner of test-basednutrition.com, using science-backed methods to improve the health and well-being of clients.\nDr. Rehman has a deep understanding of how chronic inflammation and omega imbalance affect performance and health, and he uses objective testing to demonstrate these effects. He continues to work with elite athletes and individuals, guiding them towards improved performance through tailored nutrition.",
    testimonial_1: "Launching Test-Based Nutrition is crucial because it allows us to bring objective, evidence-based approaches to health. Our mission is to educate people on the importance of omega balance and to show them, through measurable tests, the profound impact this balance can have on their health and performance.",
    credentials: [
      "MBBS / MBChB — Medical Degree",
      "Consulting Doctor — England FA",
      "Former Head of Medical and Performance — Sunderland FC",
      "Co-Director — test-basednutrition.com",
      "Sports Medicine & Musculoskeletal Health",
      "Preventive Health Screening"
    ],
    primary_category: "Medical & Clinical Specialists",
    specific_title: "General Practitioner (GP)",
    address: "Marylebone, London",
    email_address: "info@dr-rehman.co.uk",
    phone_number: "+44 7815 753332",
    clinic_name: "Dr. Rehman Nutrition Clinic",
    first_balance_result: "11.1:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/ish4-1256x889.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/ish2-634x434.jpeg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Mariusz",
    last_name: "Domasat",
    professional_title: "Elite Grappling and MMA Coach",
    professional_bio: "Mariusz Domasat is a highly respected grappling and MMA coach with a decorated career in competitive martial arts. He is a 2-time ADCC World Masters Pro Champion and a 3-time ADCC European Champion, known for his expertise in Brazilian Jiu-Jitsu, MMA, wrestling, and judo.\nAs the founder of Husaria Fight Team and the Mariusz Hetman Domasat Submission Fighting System, he has developed a reputation for innovative coaching and commitment to athlete excellence. Mariusz also serves as an ADCC A-Class Referee and Celtic Coordinator.",
    testimonial_1: "Joining Test-Based Nutrition is more than just a professional collaboration; it's a personal journey. The benefits I've seen in my daughter's development through balanced nutrition have motivated me to align with a company that shares my passion for holistic health.",
    credentials: [
      "2x ADCC World Masters Pro Champion",
      "3x ADCC European Champion",
      "Grapple Kings Heavyweight Champion",
      "ADCC A-Class Referee & Celtic Coordinator",
      "Founder — Husaria Fight Team",
      "BJJ, MMA, Wrestling, Judo"
    ],
    primary_category: "Sports Performance & Rehabilitation",
    specific_title: "Strength & Conditioning Coach",
    clinic_name: "Husaria Fight Team",
    first_balance_result: "28:1",
    second_balance_result: "2:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/mariusz3-1000x1500.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/mariusz1-698x465.jpeg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Mike",
    last_name: "Grundy",
    professional_title: "UFC Veteran & Commonwealth Games Medalist",
    professional_bio: "Mike Grundy began his athletic career as a freestyle wrestler at the age of six, eventually competing at the international level. He represented Team England in two Commonwealth Games, securing a bronze medal at the 2014 Glasgow Games. After transitioning into MMA, Mike joined the UFC, where he made his debut in front of 22,000 fans at the O2 Arena.\nAs the owner of Elite Fitness Factory, Mike now dedicates himself to coaching athletes in wrestling, Jiu-Jitsu, and MMA, passing on the discipline and expertise he gained throughout his illustrious career.",
    testimonial_1: "Test-Based Nutrition has enhanced not only my recovery but also my ability to help athletes I coach. By utilising test-based methods, we can ensure the right nutrition for optimal performance and health, especially at the cellular level.",
    credentials: [
      "UFC Veteran",
      "Commonwealth Games Bronze Medalist (2014)",
      "European Jiu-Jitsu Champion",
      "Owner — Elite Fitness Factory",
      "20+ Years Combat Sports Experience"
    ],
    primary_category: "Sports Performance & Rehabilitation",
    specific_title: "Strength & Conditioning Coach",
    clinic_name: "Elite Fitness Factory",
    first_balance_result: "18:1",
    second_balance_result: "3:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/mike-grundy-6-1015x1014.jpg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/mike-grundy3-477x611.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Sonny",
    last_name: "Hardy",
    professional_title: "Professional Boxer and Youth Coach",
    professional_bio: "Sonny Hardy is a professional boxer and dedicated youth coach who understands the importance of building strong foundations in young athletes. With a professional record of 6-0, including three knockouts, Sonny combines his in-ring experience with his knowledge as a certified personal trainer.\nFor over five years, he has coached amateur boxers, focusing on skill development, discipline, and the importance of recovery and nutrition. His commitment to youth training is evident in his work, aiming to improve not just athletic performance but also overall health and well-being.",
    testimonial_1: "Partnering with Test-Based Nutrition has been a game-changer for both my training and the young athletes I coach. Their science-backed approach to nutrition helps improve recovery, mental focus, and cellular health.",
    credentials: [
      "Professional Boxer — Record 6-0 (3 KOs)",
      "5+ Years Amateur Boxing Coach",
      "Certified Personal Trainer",
      "Youth Training Specialist"
    ],
    primary_category: "Sports Performance & Rehabilitation",
    specific_title: "Strength & Conditioning Coach",
    clinic_name: "Hardy Grappling",
    first_balance_result: "26:1",
    second_balance_result: "4.2:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/sonny-hardy-1256x1256.jpg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/sonny-hardy-5-698x740.jpeg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Lyndsey",
    last_name: "Hopper",
    professional_title: "Personal Trainer & Online Wellness Coach",
    professional_bio: "Lyndsey Hopper is a personal trainer and online wellness coach with over 10 years of personal training experience. With a background in Sport Science and a personal health and fitness journey, Lyndsey understands the challenges many face when trying to improve their health.\nShe is dedicated to helping her clients learn how to nourish and move their bodies properly, while building confidence in the gym. Lyndsey specialises in creating personalised fitness plans for individuals along with nutritional guidance, and healthy habit building.",
    testimonial_1: "What I love about Test-Based Nutrition is that it's based on actual data. We know exactly what the body needs, rather than guessing. It fits perfectly with my approach because I can help clients not only with fitness and nutrition but also with their cellular health.",
    credentials: [
      "BSc Sport Science (First-Class Honours)",
      "10+ Years Personal Training Experience",
      "Online Wellness Coaching",
      "Nutritional Guidance Specialist"
    ],
    primary_category: "Health, Lifestyle, Mindset & Beauty",
    specific_title: "Health Coach",
    clinic_name: "David Lloyd Southend",
    first_balance_result: "13:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/0a4ad164-ccc2-4459-a338-38f4cb2fce4e-1256x1675.jpg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/133eeab8-4ba2-4af3-932c-258cc70b76521-698x931.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Trevor",
    last_name: "Ford",
    professional_title: "Senior Personal Trainer & Nutrition Specialist",
    professional_bio: "With 18 years of experience as a personal trainer, Trevor has led a team of trainers at David Lloyd, one of the UK's premier fitness clubs. His role as manager involves developing comprehensive training programmes that cater to a broad clientele, from young athletes to seniors seeking vitality and strength.\nTrevor's holistic approach integrates targeted nutrition with personalised training programmes, focusing on inflammation reduction, mental clarity, and cellular health optimisation.",
    testimonial_1: "Partnering with Test-Based Nutrition has revolutionised my ability to support my clients' health journeys. Their scientifically-backed supplements enhance cellular health, reduce inflammation, and improve mental clarity.",
    credentials: [
      "18+ Years Personal Training Experience",
      "Manager & Team Leader — David Lloyd",
      "Nutrition Specialist",
      "Inflammation Reduction Expert",
      "Mental Performance Coaching"
    ],
    primary_category: "Health, Lifestyle, Mindset & Beauty",
    specific_title: "Health Coach",
    clinic_name: "David Lloyd",
    first_balance_result: "18:1",
    second_balance_result: "2:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/trevor-ford-1-1125x1500.jpg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/trevor-ford-3-698x465.jpeg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Fiona",
    last_name: "Pursglove",
    professional_title: "Naturopathic Nutritionist",
    professional_bio: "Fiona is a qualified naturopathic nutritionist with a background in managing her own health challenges, which led her to pursue a career in nutrition. After experiencing gastrointestinal issues in her 20s, Fiona was inspired to learn more about how nutrition could resolve these issues.\nAs the founder of FigTree Nutrition & Health, she uses a holistic approach to empower her clients to take control of their health, specialising in gut health, hormone balance and fertility issues.",
    testimonial_1: "Partnering with Test-Based Nutrition gives me a vital tool to help clients understand their unique nutritional needs. The balance testing provides invaluable insights, allowing us to address deficiencies and optimise health at the cellular level.",
    credentials: [
      "Qualified Naturopathic Nutritionist",
      "Founder — FigTree Nutrition & Health",
      "College of Naturopathic Medicine Graduate",
      "Gut Health Specialist",
      "Hormone Balance & Fertility"
    ],
    primary_category: "Functional, Preventative & Holistic Health",
    specific_title: "Nutritional Therapist",
    clinic_name: "FigTree Nutrition & Health",
    first_balance_result: "24:1",
    second_balance_result: "3:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/fiona-11-1256x837.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/fiona-9-698x698.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Emily",
    last_name: "Holland",
    professional_title: "Gut and Skin Health Specialist",
    professional_bio: "Emily Holland, founder of Emily Holland Wellness, is dedicated to helping individuals overcome gut and skin health issues through holistic methods. Her personal journey with cystic acne led her to explore alternative treatments, eventually becoming a certified holistic nutritionist.\nEmily specialises in gut health, addressing conditions such as IBS, fatigue, and skin issues like eczema and acne. She uses food intolerance testing and customised detox protocols to support her clients in achieving optimal health.",
    testimonial_1: "Partnering with Test-Based Nutrition aligns perfectly with my commitment to holistic health. Their evidence-based approach to nutrition complements my focus on reducing inflammation and promoting natural healing for my clients.",
    credentials: [
      "Certified Holistic Nutritionist",
      "Founder — Emily Holland Wellness",
      "Gut Health Specialist",
      "Skin Health & Acne Expert",
      "Food Intolerance Testing"
    ],
    primary_category: "Functional, Preventative & Holistic Health",
    specific_title: "Nutritional Therapist",
    clinic_name: "Emily Holland Wellness",
    email_address: "emilyhollandwellness@gmail.com",
    profile_picture_url: "https://test-basednutrition.com/assets/images/612056a2-c50b-4e85-9b8d-4639e40f9106-1256x942.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/7153dd7b-7bb7-47be-b82d-864b5c1a68831-698x386.jpeg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Kia",
    last_name: "Porter",
    professional_title: "Holistic Health Specialist & Naturopathic Health Coach",
    professional_bio: "Kia Porter is a naturopathic health coach who has inspired and supported thousands of individuals on their wellness journeys. As the founder of Kia Porter Health, she is passionate about educating people on how to heal naturally by addressing the root causes of their health issues.\nA student at the College of Naturopathic Medicine, Kia specialises in supporting clients to reduce environmental and dietary stressors, improve gut health, and strengthen the immune system.",
    testimonial_1: "Partnering with Test-Based Nutrition allows me to offer clients scientifically-backed tools to support their health. By using balance testing and nutritional strategies, we can address deficiencies and toxic exposures to ensure optimal health and well-being.",
    credentials: [
      "Naturopathic Health Coach (Student)",
      "Founder — Wellness Journey with Kia",
      "Gut Health Specialist",
      "Environmental Toxin Awareness",
      "Immune System Optimisation"
    ],
    primary_category: "Functional, Preventative & Holistic Health",
    specific_title: "Holistic Health Practitioner",
    clinic_name: "Wellness Journey with Kia",
    profile_picture_url: "https://test-basednutrition.com/assets/images/kia-1-1125x1500.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/kia-6-698x937.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Sally",
    last_name: "Butler",
    professional_title: "Nutritional Intolerance & Emotional Well-being Practitioner",
    professional_bio: "Sally Butler founded The Mint Heart in 2006, driven by a passion for holistic health and well-being. As a Certified Nutritional Intolerance Counsellor and Emotional Well-being Practitioner, Sally offers a unique blend of services that include Allergy and Intolerance Testing, Meditation, Bach Flower Essence and Emotional Counselling.\nHer philosophy focuses on treating the whole person by addressing nutritional deficiencies, emotional well-being, and cellular health through a combination of intolerance testing, personalised nutrition plans, and emotional support.",
    testimonial_1: "Partnering with Test-Based Nutrition allows me to provide clients with a scientifically proven approach to health. By focusing on test-based methods rather than guesswork, we can accurately identify deficiencies and create tailored solutions.",
    credentials: [
      "Founder — The Mint Heart (Est. 2006)",
      "Certified Nutritional Intolerance Counsellor",
      "Emotional Well-being Practitioner",
      "Bach Flower Essence Practitioner",
      "Meditation Teacher"
    ],
    primary_category: "Health, Lifestyle, Mindset & Beauty",
    specific_title: "Mindset Coach",
    clinic_name: "The Mint Heart",
    profile_picture_url: "https://test-basednutrition.com/assets/images/dsc07409-1256x837.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/the-mint-heart-logo-698x1047.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Jayden",
    last_name: "Blanchard",
    professional_title: "Doctor of Chiropractic",
    professional_bio: "Jayden Blanchard works at Life Chiropractic Basildon, where he focuses on helping patients recover from pain and improve their overall mobility. The clinic's advanced X-ray diagnostics and rehabilitation services provide the foundation for comprehensive care.\nJayden is passionate about going beyond the typical chiropractic approach, always seeking ways to enhance his patients' recovery. Incorporating Test-Based Nutrition into his practice allows him to give a more complete service, addressing not only physical adjustments but also the internal factors that contribute to long-term health.",
    testimonial_1: "Test-Based Nutrition allows me to give my patients a more thorough approach to their wellness by addressing cellular health and reducing inflammation. This helps ensure faster recovery and better long-term results, whether they are athletes or everyday patients.",
    credentials: [
      "Doctor of Chiropractic (DC)",
      "Advanced X-Ray Diagnostics",
      "Rehabilitation & Recovery Specialist",
      "Cellular Health Integration"
    ],
    primary_category: "Allied Health & Clinical Practitioners",
    specific_title: "Chiropractor",
    address: "Essex, London",
    clinic_name: "Life Chiropractic Basildon",
    profile_picture_url: "https://test-basednutrition.com/assets/images/jayden-blanchard-3-1256x1883.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/jayden-blanchard-1-698x1046.jpg"],
    consultation_type: "Online Only",
    accepting_new_clients: true
  },
  {
    first_name: "William",
    last_name: "Todd",
    professional_title: "Strength & Conditioning Coach and Tennis Coach",
    professional_bio: "William Todd began his career as a semi-professional tennis player and transitioned into coaching after earning his LTA Level 3 and ITF Level 1 tennis coaching certifications. Over 12 years, Will has coached across the USA, Spain, New Zealand, and the UK, working with athletes of all levels.\nHe specialises in strength and conditioning, particularly Olympic weightlifting and injury rehabilitation. His international experience gives him a unique perspective on training methods, which he incorporates into his holistic approach.",
    testimonial_1: "Test-Based Nutrition helps me bring real data into my coaching, providing insights into my clients' inflammation levels. This allows us to adjust training plans effectively.",
    credentials: [
      "LTA Level 3 Tennis Coach",
      "ITF Level 1 Tennis Coach",
      "12 Years International Coaching Experience",
      "Olympic Weightlifting Specialist",
      "Injury Rehabilitation"
    ],
    primary_category: "Sports Performance & Rehabilitation",
    specific_title: "Strength & Conditioning Coach",
    email_address: "will@wtenessfitness.com",
    first_balance_result: "15:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/william-todd-2-1256x1256.jpg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/william-todd-4-698x688.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Kimberly",
    last_name: "Whittall",
    professional_title: "Rapid Transformation Therapy & Mindset Expert",
    professional_bio: "Kimberly Whittall is a rapid transformational therapy (RTT) practitioner and mindset expert, dedicated to helping individuals overcome unconscious barriers to success and well-being.\nThrough her brand, The Connection Rebel, Kimberly takes a holistic, 360-degree approach to well-being, combining mindset work with health support, helping clients create lasting changes in both their mental and physical health.",
    testimonial_1: "Test-Based Nutrition complements my work by providing the missing link between mindset coaching and physical health. Through balance testing, we can tackle the internal factors that affect well-being, giving clients a complete picture of their health.",
    credentials: [
      "Rapid Transformational Therapy (RTT) Practitioner",
      "Mindset & Success Coach",
      "Founder — The Connection Rebel",
      "Holistic Well-being Expert"
    ],
    primary_category: "Health, Lifestyle, Mindset & Beauty",
    specific_title: "Mindset Coach",
    clinic_name: "The Connection Rebel",
    first_balance_result: "26:1",
    second_balance_result: "3:1",
    profile_picture_url: "https://test-basednutrition.com/assets/images/kimberly-whittall-malloch-1-1066x1600.jpeg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/kimberly-whittall-malloch-4-698x1048.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  },
  {
    first_name: "Ross",
    last_name: "Pearce",
    professional_title: "Professional Boxing Coach",
    professional_bio: "Ross Pearce has been a professional boxing coach at RJ's Boxing Gym in Essex for over 5 years. With a personal boxing career spanning 15 years, Ross brings a wealth of experience to his coaching. In 2022, Ross coached his fighter, Liam Dillon, to win the British title.\nRoss currently trains six professional fighters and provides personal training sessions for individuals at all fitness levels. His approach to coaching focuses on tailored training plans, discipline, and overall health.",
    testimonial_1: "Partnering with Test-Based Nutrition ensures that my athletes and I are not just guessing about our health. With balance testing, we can focus on real, measurable results.",
    credentials: [
      "Professional Boxing Coach — 5+ Years",
      "Personal Boxing Career — 15 Years",
      "Trained British Title Holder (Liam Dillon, 2022)",
      "Personal Training Certification"
    ],
    primary_category: "Sports Performance & Rehabilitation",
    specific_title: "Strength & Conditioning Coach",
    clinic_name: "RJ's Boxing Gym",
    profile_picture_url: "https://test-basednutrition.com/assets/images/ross-pearce-4-1200x1500.jpg",
    gallery_image_urls: ["https://test-basednutrition.com/assets/images/ross-pearce-3-698x873.jpg"],
    consultation_type: "Both",
    accepting_new_clients: true
  }
];

async function insertData() {
  console.log(`Inserting ${expertsToAdd.length} experts into Supabase...`);
  
  for (const expert of expertsToAdd) {
    // Note: since anon key is usually not allowed to bypass RLS for inserts without user auth,
    // this will simulate that we are adding data. If RLS is enabled, we'll need a service key.
    // However, the testbed might have permissive RLS. Let's try.
    const { data, error } = await supabase.from('specialists').insert([expert]);
    if (error) {
      console.error(`Failed to insert ${expert.first_name}:`, error.message);
    } else {
      console.log(`Successfully added ${expert.first_name} ${expert.last_name}`);
    }
  }
}

insertData();
