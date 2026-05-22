// 5-question quizzes for each Girls Library resource
const QUIZZES = {
  1: { // Daily Hygiene Routine
    questions: [
      { q: "How long should you brush your teeth each session?", options: ["30 seconds", "1 minute", "2 minutes", "5 minutes"], answer: 2 },
      { q: "When should you apply deodorant for best results?", options: ["On wet skin", "On clean, dry skin", "Before showering", "Only at night"], answer: 1 },
      { q: "How often should you change your pillowcase for healthy skin?", options: ["Once a month", "Every day", "Weekly", "Every 2 weeks"], answer: 2 },
      { q: "What is the best time to moisturize your skin?", options: ["When skin is completely dry", "While skin is still slightly damp", "Before showering", "Only at night"], answer: 1 },
      { q: "How often should you see a dentist?", options: ["Once a year", "Every 6 months", "Every 3 months", "Only when there's pain"], answer: 1 },
    ]
  },
  2: { // Period Hygiene & Care
    questions: [
      { q: "How often should you change a pad?", options: ["Every 12 hours", "Once a day", "Every 4-6 hours", "Only when it feels full"], answer: 2 },
      { q: "What is the maximum time to leave a tampon in?", options: ["4 hours", "6 hours", "8 hours", "12 hours"], answer: 2 },
      { q: "Which food can help with period cramps?", options: ["Chips and soda", "Dark chocolate and bananas", "Coffee", "Fried foods"], answer: 1 },
      { q: "What should you pack in your school period kit?", options: ["Just pads", "2-3 pads/tampons, pain reliever, wipes, backup underwear", "Only pain reliever", "A full medicine kit"], answer: 1 },
      { q: "When should you see a doctor about your period?", options: ["After every period", "If it lasts 10+ days or soaking a pad per hour", "If you have any cramps", "Only if you miss one period"], answer: 1 },
    ]
  },
  3: { // Skincare for Glowing Skin
    questions: [
      { q: "Which skin type has an oily T-zone but dry cheeks?", options: ["Oily", "Dry", "Combination", "Sensitive"], answer: 2 },
      { q: "What should ALWAYS be the last step of your morning routine?", options: ["Moisturizer", "Cleanser", "Sunscreen (SPF)", "Toner"], answer: 2 },
      { q: "What drugstore ingredient reduces redness and oil?", options: ["Benzoyl peroxide", "Niacinamide", "Retinol", "Salicylic acid"], answer: 1 },
      { q: "How many glasses of water should you drink daily for good skin?", options: ["2-3 glasses", "5-6 glasses", "8+ glasses", "1 glass"], answer: 2 },
      { q: "Should you wear sunscreen on cloudy days?", options: ["No, only on sunny days", "Yes, always", "Only at the beach", "Only in summer"], answer: 1 },
    ]
  },
  4: { // Managing Acne & Breakouts
    questions: [
      { q: "What percentage of teens experience acne?", options: ["25%", "50%", "85%", "100%"], answer: 2 },
      { q: "Which ingredient is best for unclogging pores and blackheads?", options: ["Benzoyl peroxide", "Salicylic acid", "Retinol", "Niacinamide"], answer: 1 },
      { q: "Why should you NEVER pop pimples?", options: ["It's too painful", "It causes scarring and more breakouts", "It doesn't do anything", "It spreads to others"], answer: 1 },
      { q: "How often should you change your pillowcase to help with acne?", options: ["Once a month", "2x per week", "Once a week", "Every day"], answer: 1 },
      { q: "When should you see a dermatologist for acne?", options: ["After one week", "After OTC products don't work for 3 months", "As soon as you get one pimple", "Never"], answer: 1 },
    ]
  },
  5: { // Budgeting 101
    questions: [
      { q: "In the 50/30/20 rule, what does the 20% represent?", options: ["Wants", "Needs", "Savings & goals", "Entertainment"], answer: 2 },
      { q: "What is the first step to building a budget?", options: ["Set savings goals", "Track your spending", "Know your income", "Download an app"], answer: 2 },
      { q: "What does 'pay yourself first' mean?", options: ["Buy what you want first", "Save before you spend", "Pay bills immediately", "Reward yourself monthly"], answer: 1 },
      { q: "Which is a good budgeting app for teens?", options: ["TikTok", "Instagram", "Greenlight", "Snapchat"], answer: 2 },
      { q: "What does compound interest do to your savings?", options: ["Reduces them over time", "Keeps them the same", "Grows them over time", "Has no effect"], answer: 2 },
    ]
  },
  6: { // Teen Side Hustles
    questions: [
      { q: "Which is a skills-based side hustle?", options: ["Dog walking", "Tutoring classmates", "Lawn mowing", "Car washing"], answer: 1 },
      { q: "What platform can you use to sell handmade items?", options: ["LinkedIn", "Etsy", "Indeed", "Glassdoor"], answer: 1 },
      { q: "What should be your FIRST step when starting a hustle?", options: ["Invest a lot of money", "Tell everyone you know", "Pick ONE hustle to start with", "Quit school"], answer: 2 },
      { q: "How much of your hustle earnings should you save?", options: ["5%", "10%", "At least 20%", "50%"], answer: 2 },
      { q: "Where can you resell thrifted clothes online?", options: ["Amazon", "eBay only", "Depop or Poshmark", "Facebook Marketplace only"], answer: 2 },
    ]
  },
  7: { // Finding Scholarships
    questions: [
      { q: "When should you start applying for scholarships?", options: ["Senior year only", "Junior year of high school", "After getting accepted to college", "During freshman year of college"], answer: 1 },
      { q: "Which type of scholarship has less competition?", options: ["National scholarships", "Merit-based scholarships", "Small local scholarships", "Athletic scholarships"], answer: 2 },
      { q: "What is the FAFSA?", options: ["A scholarship application", "Free Application for Federal Student Aid", "A college entrance exam", "A grant for arts students"], answer: 1 },
      { q: "When does the FAFSA open for senior year?", options: ["January 1st", "October 1st", "March 1st", "August 1st"], answer: 1 },
      { q: "What's the most important tip for scholarship essays?", options: ["Use a generic template", "Keep it short", "Customize each essay — never use a generic one", "Focus on your grades only"], answer: 2 },
    ]
  },
  8: { // College Prep Guide
    questions: [
      { q: "When does the Common App open for applications?", options: ["January 1st", "August 1st", "October 1st", "March 1st"], answer: 1 },
      { q: "What does a 'balanced college list' include?", options: ["Only reach schools", "Only safety schools", "Safety, match, and reach schools", "Only schools with scholarships"], answer: 2 },
      { q: "What is the most important element of a college application?", options: ["Test scores", "Your unique essay voice", "Number of clubs joined", "Your GPA only"], answer: 1 },
      { q: "When should you request recommendation letters?", options: ["The week before deadline", "Summer before 12th grade", "During junior year", "After applying"], answer: 1 },
      { q: "What deadline must you decide by for college acceptance?", options: ["March 1st", "April 1st", "May 1st", "June 1st"], answer: 2 },
    ]
  },
  9: { // Starting Your Own Business
    questions: [
      { q: "What is the first question in a simple business plan?", options: ["Who is your customer?", "What product or service are you selling?", "How will you market it?", "What is your profit goal?"], answer: 1 },
      { q: "What should you do BEFORE investing heavily in your business?", options: ["Hire employees", "Start small and test your idea", "Build a website", "Register a trademark"], answer: 1 },
      { q: "Where should you keep business money?", options: ["In your regular savings", "In cash at home", "In a separate savings account", "In a business credit card only"], answer: 2 },
      { q: "What free tool can teens use to start designing?", options: ["Adobe Photoshop", "Canva", "Figma (paid)", "Sketch"], answer: 1 },
      { q: "What is the best time to start a business?", options: ["After college", "When you feel 100% ready", "Before you feel ready", "After getting a job first"], answer: 2 },
    ]
  },
  10: { // Interview Prep
    questions: [
      { q: "When should you arrive for an interview?", options: ["Exactly on time", "10-15 minutes early", "30 minutes early", "5 minutes late is fine"], answer: 1 },
      { q: "How should you answer 'What's your weakness?'", options: ["Say you have no weaknesses", "Be honest AND show growth", "Make up a fake weakness", "Say you're a perfectionist"], answer: 1 },
      { q: "What should you send within 24 hours after an interview?", options: ["A gift", "A thank-you email", "Your transcript", "A follow-up phone call"], answer: 1 },
      { q: "What does your body language in an interview communicate?", options: ["Nothing — only words matter", "Confidence and professionalism", "How nervous you are", "Your grades"], answer: 1 },
      { q: "What should you do BEFORE an interview?", options: ["Wing it and be natural", "Research the company or program", "Memorize a script word for word", "Avoid preparing so you seem spontaneous"], answer: 1 },
    ]
  },
  11: { // Personal Safety
    questions: [
      { q: "What is a red flag in a relationship?", options: ["Someone who supports your friendships", "Someone who isolates you from friends/family", "Someone who checks in on you", "Someone who is protective"], answer: 1 },
      { q: "What does wearing headphones in both ears affect?", options: ["Your style", "Your awareness of surroundings", "Your walking speed", "Nothing important"], answer: 1 },
      { q: "What should you do if you feel unsafe?", options: ["Handle it alone", "Call 911 or text 911", "Wait and see", "Ignore the feeling"], answer: 1 },
      { q: "What is the National Domestic Violence Hotline number?", options: ["1-800-799-7233", "911", "988", "1-800-273-8255"], answer: 0 },
      { q: "Is it 'overreacting' to leave a dangerous situation?", options: ["Yes, always stay calm", "No — getting out is never overreacting", "Sometimes, depending on the situation", "Yes, if it makes others uncomfortable"], answer: 1 },
    ]
  },
  12: { // Online Safety
    questions: [
      { q: "What should you NEVER share online?", options: ["Your favorite movie", "Your home address or school name", "Your hobbies", "Your first name"], answer: 1 },
      { q: "Which is a warning sign of an online predator?", options: ["Asking your favorite color", "Offering money or gifts and wanting secrecy", "Following your public posts", "Commenting on your art"], answer: 1 },
      { q: "What should you do if something goes wrong online?", options: ["Delete everything and say nothing", "Screenshot evidence, then tell a trusted adult", "Block and ignore", "Respond to the person angrily"], answer: 1 },
      { q: "What is 2-factor authentication?", options: ["Using two passwords", "An extra security step beyond your password", "Having two accounts", "Logging in from two devices"], answer: 1 },
      { q: "Where do you report online exploitation of minors?", options: ["YouTube", "Twitter/X", "NCMEC CyberTipline (cybertipline.org)", "Your school principal only"], answer: 2 },
    ]
  },
  13: { // Study Skills
    questions: [
      { q: "What does the Pomodoro Method involve?", options: ["Studying for 3 hours straight", "25 min focus, 5 min break", "Reading all night", "Listening to music while studying"], answer: 1 },
      { q: "What does 'active recall' mean?", options: ["Reading the textbook twice", "Highlighting important points", "Closing the book and quizzing yourself", "Copying notes from class"], answer: 2 },
      { q: "When should you review notes before a test?", options: ["The night before only", "Day of the test", "3 days before, not the night before", "A week before"], answer: 2 },
      { q: "Why is 'spaced repetition' more effective than cramming?", options: ["It takes less time total", "Your brain retains information better over spread-out sessions", "It's more fun", "Teachers prefer it"], answer: 1 },
      { q: "How many hours of sleep should you get the night before a test?", options: ["4-5 hours", "6 hours", "8+ hours", "Sleep doesn't matter"], answer: 2 },
    ]
  },
  14: { // Note-Taking
    questions: [
      { q: "In the Cornell Method, what goes in the left column?", options: ["Main notes from class", "Key questions and cues", "Your summary", "Vocabulary words"], answer: 1 },
      { q: "Studies show which type of notes leads to BETTER retention?", options: ["Typed notes on a laptop", "Voice-recorded notes", "Handwritten notes", "Notes in bullet points only"], answer: 2 },
      { q: "What is the Mind Map method best for?", options: ["Sequential information", "Visual learners and brainstorming", "Math problems", "Essay outlines"], answer: 1 },
      { q: "When should you review and add to your notes after class?", options: ["A week later", "Within 24 hours", "The night before the test", "Never — notes are done in class"], answer: 1 },
      { q: "Why should you write notes in your own words?", options: ["It's faster", "You process and understand it better", "Teachers require it", "Saves paper"], answer: 1 },
    ]
  },
  15: { // Test Prep
    questions: [
      { q: "What should you do the night BEFORE a test?", options: ["Cram everything at once", "Light review only and get 8-9 hours of sleep", "Study for 5+ hours", "Watch review videos all night"], answer: 1 },
      { q: "When should you start serious test prep?", options: ["Night before", "Day of the test", "1-2 weeks before", "The same day"], answer: 2 },
      { q: "What breathing technique helps with test anxiety?", options: ["Holding your breath", "4-7-8 breathing", "Breathing very fast", "Deep sighing"], answer: 1 },
      { q: "What should you do when you encounter a hard question on a test?", options: ["Panic and spend all your time on it", "Skip it and come back later", "Leave it blank permanently", "Change all your other answers"], answer: 1 },
      { q: "What should your breakfast be on test day?", options: ["Skip breakfast to stay sharp", "A protein-rich breakfast", "Just coffee or energy drink", "A heavy carb-loaded meal"], answer: 1 },
    ]
  },
  16: { // Natural Hair Care
    questions: [
      { q: "What does the 'L' in the LOC method stand for?", options: ["Lotion", "Liquid (water-based)", "Leave-in conditioner only", "Lather"], answer: 1 },
      { q: "Why is moisture especially important for Black hair?", options: ["It makes styling easier", "Natural oils have a harder time traveling down the curl", "It speeds up growth", "It reduces breakage only"], answer: 1 },
      { q: "Which ingredient should you AVOID in hair products?", options: ["Shea butter", "Castor oil", "Sulfates (they're drying)", "Aloe vera"], answer: 2 },
      { q: "When should you style your natural hair?", options: ["When it's completely dry", "While it's still damp", "After blow-drying", "Only after air-drying overnight"], answer: 1 },
      { q: "What should you do during deep conditioning for best results?", options: ["Rinse immediately", "Use heat (15-30 min)", "Skip it if you're busy", "Apply on dry hair"], answer: 1 },
    ]
  },
  17: { // Hair Porosity
    questions: [
      { q: "How do you test your hair's porosity?", options: ["By feeling the texture", "Drop a clean strand in water — float=low, sink=high", "Ask a hairstylist", "By looking in the mirror"], answer: 1 },
      { q: "What is a sign of LOW porosity hair?", options: ["Absorbs water quickly", "Dries very fast", "Products sit on top, water beads up", "Breaks easily"], answer: 2 },
      { q: "What works best for HIGH porosity hair?", options: ["Lightweight products only", "Protein treatments and heavier butters/creams", "Clarifying shampoo daily", "Avoiding oils entirely"], answer: 1 },
      { q: "What causes high porosity in hair?", options: ["Drinking too much water", "Heat damage, chemicals, or genetics", "Using too much conditioner", "Natural curl pattern"], answer: 1 },
      { q: "Why does knowing your porosity matter?", options: ["It doesn't really matter", "So you stop wasting money on products that don't work for you", "To brag to friends", "It only matters for locs"], answer: 1 },
    ]
  },
  18: { // Protective Styles
    questions: [
      { q: "Why do protective styles help retain length?", options: ["They make hair grow faster", "They protect fragile ends from breakage", "They add moisture automatically", "They eliminate split ends"], answer: 1 },
      { q: "How often should you take down a protective style to prevent matting?", options: ["Every week", "Before 8 weeks", "After 6 months", "Only when it looks bad"], answer: 1 },
      { q: "What should you ALWAYS wear to bed to protect your hair?", options: ["A beanie", "A satin bonnet or pillowcase", "A regular cotton towel", "Nothing — let it breathe"], answer: 1 },
      { q: "Why shouldn't braids be too tight?", options: ["They take too long", "They cause breakage and traction alopecia", "They don't look good tight", "Tight braids fade faster"], answer: 1 },
      { q: "What should you do AFTER taking down a protective style?", options: ["Re-install immediately", "Deep condition", "Trim all the hair", "Use heat styling right away"], answer: 1 },
    ]
  },
  19: { // People Pleasing
    questions: [
      { q: "Which is a sign of people pleasing?", options: ["Saying no when you mean no", "Feeling guilty when you prioritize yourself", "Setting clear boundaries", "Expressing your opinions confidently"], answer: 1 },
      { q: "What is a cost of chronic people pleasing?", options: ["More friendships", "Resentment builds over time", "Higher self-esteem", "Better grades"], answer: 1 },
      { q: "What's a good phrase to use when you need time before responding?", options: ["'Yes, definitely!'", "'Let me think about that and get back to you'", "'No way!'", "'Whatever you need'"], answer: 1 },
      { q: "Does feeling guilty after saying no mean you did something wrong?", options: ["Yes, always", "No — guilt doesn't mean wrong", "Sometimes", "Only if the person is upset"], answer: 1 },
      { q: "Saying no to what doesn't serve you is saying _____ to yourself.", options: ["Maybe", "Later", "Yes", "Sorry"], answer: 2 },
    ]
  },
  20: { // Mental Wellness
    questions: [
      { q: "What is the #1 mental health tool?", options: ["Exercise", "Therapy", "8-9 hours of sleep", "Journaling"], answer: 2 },
      { q: "How long should symptoms persist before seeking help?", options: ["1 day", "2+ weeks", "6 months", "1 year"], answer: 1 },
      { q: "What is the Crisis Text Line number?", options: ["Text HELP to 911", "Text HOME to 741741", "Text SOS to 988", "Text CARE to 555"], answer: 1 },
      { q: "What daily habit helps with mental health?", options: ["Sleeping 4 hours", "Scrolling social media for 4+ hours", "Moving your body — even a 20-minute walk", "Staying indoors all day"], answer: 2 },
      { q: "What is the recommended daily limit for social media?", options: ["30 minutes", "1 hour", "2 hours max", "No limit"], answer: 2 },
    ]
  },
  21: { // Staying Present
    questions: [
      { q: "What does mindfulness mean?", options: ["Meditating for hours", "Paying attention to the present moment on purpose", "Thinking about your future goals", "Avoiding all screens"], answer: 1 },
      { q: "How many things do you name that you can SEE in the 5-4-3-2-1 technique?", options: ["3", "4", "5", "2"], answer: 2 },
      { q: "What is a good tech boundary for being more present?", options: ["No phone for first 30 min after waking", "Check phone every 10 minutes", "Sleep with your phone", "Keep notifications on always"], answer: 0 },
      { q: "Living constantly in the past or future means you miss what?", options: ["Your future", "The present — the only thing that's real", "Your memories", "Your goals"], answer: 1 },
      { q: "What is mindful eating?", options: ["Counting calories carefully", "Eating as fast as possible", "Putting the phone down and actually tasting your food", "Eating only healthy foods"], answer: 2 },
    ]
  },
  22: { // Growth Mindset
    questions: [
      { q: "What does a growth mindset say when you fail?", options: ["'I'll never be good at this'", "'What can I learn from this?'", "'I give up'", "'This is too hard for me'"], answer: 1 },
      { q: "Who researched and proved the growth mindset concept?", options: ["Oprah Winfrey", "Carol Dweck at Stanford", "Albert Einstein", "Malcolm Gladwell"], answer: 1 },
      { q: "What powerful word can you add to fixed mindset thoughts?", options: ["'Never'", "'Always'", "'Yet'", "'Maybe'"], answer: 2 },
      { q: "What does a fixed mindset say about talent?", options: ["Anyone can develop skills", "'She worked hard to get there'", "'She's naturally talented — I could never'", "'Practice makes perfect'"], answer: 2 },
      { q: "What physically happens to your brain when you learn?", options: ["Nothing — the brain is fixed", "It grows new connections", "It shrinks temporarily", "Brain cells die"], answer: 1 },
    ]
  },
  23: { // Buying Your First Car
    questions: [
      { q: "What percentage of your monthly income should a car payment be at most?", options: ["5%", "15%", "30%", "50%"], answer: 1 },
      { q: "Why is a used car (1-4 years old) often smarter than new?", options: ["New cars are unreliable", "New cars lose 20% of value the moment you drive off the lot", "Used cars have better warranties", "New cars are harder to insure"], answer: 1 },
      { q: "What should you do BEFORE visiting a dealership?", options: ["Decide exactly which car you want to buy", "Get pre-approved for financing at your bank", "Test drive many cars first", "Call the salesperson"], answer: 1 },
      { q: "What tool helps you check a car's history?", options: ["Google Maps", "Carfax or AutoCheck", "AutoTrader only", "The dealership's word"], answer: 1 },
      { q: "Which is a major red flag at a dealership?", options: ["Offering a test drive", "'Special deal only good right now' pressure", "Showing you the full price", "Letting you take time to decide"], answer: 1 },
    ]
  },
  24: { // Buying a Home
    questions: [
      { q: "What is 'equity' in homeownership?", options: ["Monthly rent payments", "Money that belongs to you in the home's value", "The interest on your mortgage", "Your down payment only"], answer: 1 },
      { q: "What is the minimum down payment for an FHA loan?", options: ["10%", "20%", "3.5%", "0%"], answer: 2 },
      { q: "What should you do to prepare for buying a home years from now?", options: ["Wait and do nothing yet", "Build credit, save for down payment, reduce debt", "Only save money", "Avoid any credit cards"], answer: 1 },
      { q: "What is a mortgage?", options: ["Monthly rent to a landlord", "A bank loan to buy a home, paid back over 15-30 years", "A home insurance policy", "A type of savings account"], answer: 1 },
      { q: "When does buying a home build WEALTH compared to renting?", options: ["Renting always builds more wealth", "Buying builds equity that belongs to you; renting builds the landlord's wealth", "They're equal financially", "Only if the market goes up"], answer: 1 },
    ]
  },
  25: { // Leaving Uncomfortable Situations
    questions: [
      { q: "Do you need a reason to leave a situation that doesn't feel right?", options: ["Yes, you need a valid excuse", "No — your safety and comfort are enough", "Only if you feel in danger", "Only with permission from friends"], answer: 1 },
      { q: "What is the 'Fake Call Trick'?", options: ["Calling a friend to talk", "Setting a timer so your phone goes off as an excuse to leave", "Faking an emergency", "Pretending your battery died"], answer: 1 },
      { q: "What app lets someone virtually walk you home?", options: ["Waze", "Life360", "Companion", "Google Maps"], answer: 2 },
      { q: "What should you do if the driver is intoxicated?", options: ["Stay quiet and hope for the best", "Ask them to pull over and call someone else", "Distract them with conversation", "Take the wheel yourself"], answer: 1 },
      { q: "How should a real friend react if you leave to keep yourself safe?", options: ["They'll be upset", "They'll understand and support you", "They'll never talk to you again", "They'll think you're dramatic"], answer: 1 },
    ]
  },
  26: { // Getting Pulled Over
    questions: [
      { q: "What should you do FIRST when you see police lights behind you?", options: ["Speed up to find a safe spot", "Turn on hazard lights and pull to the right", "Stop in the middle of the road", "Call someone immediately"], answer: 1 },
      { q: "Where should your hands be when the officer approaches?", options: ["In your lap", "Reaching for your documents", "Visible on the steering wheel", "In your pockets"], answer: 2 },
      { q: "Can you decline a vehicle search?", options: ["No, you must always comply", "Yes — 'I do not consent to a search'", "Only if you have a lawyer present", "Only adults can decline"], answer: 1 },
      { q: "If you feel your rights were violated, what's the right move?", options: ["Argue on the roadside", "Address it in court — not on the roadside", "Refuse to cooperate at all", "Post about it on social media immediately"], answer: 1 },
      { q: "What should you turn on at night when pulled over?", options: ["Your high beams", "Interior lights", "Hazard lights only", "Nothing extra"], answer: 1 },
    ]
  },
  27: { // Car Insurance
    questions: [
      { q: "What does LIABILITY insurance cover?", options: ["Damage to YOUR car", "Damage you cause to OTHERS", "Theft of your car", "Weather damage"], answer: 1 },
      { q: "What is a 'deductible'?", options: ["Your monthly premium", "What you pay out-of-pocket before insurance kicks in", "Your coverage limit", "A discount for good driving"], answer: 1 },
      { q: "What insurance covers theft and weather damage?", options: ["Liability", "Collision", "Comprehensive", "Uninsured motorist"], answer: 2 },
      { q: "How can teen drivers reduce their insurance premium?", options: ["Drive more often to show experience", "Get good grades — many insurers offer a discount", "Add more coverage", "Drive an expensive car"], answer: 1 },
      { q: "Where should you always have proof of insurance?", options: ["Only at home", "In your car and on your phone", "Only on your phone", "In a safety deposit box"], answer: 1 },
    ]
  },
  28: { // Nails on a Budget
    questions: [
      { q: "What makes nail polish last twice as long?", options: ["Base coat", "Top coat", "Cuticle oil", "Two coats of color"], answer: 1 },
      { q: "What should you NEVER cut during a manicure?", options: ["Your nails", "Your cuticles", "Damaged polish", "Old nail tips"], answer: 1 },
      { q: "How should you file your nails correctly?", options: ["Back and forth vigorously", "In one direction only", "In circles", "With a metal file only"], answer: 1 },
      { q: "Which is an affordable nail polish brand?", options: ["Chanel", "Dior", "Sally Hansen", "Tom Ford"], answer: 2 },
      { q: "What should you apply daily for healthy nails?", options: ["Base coat", "Nail polish remover", "Cuticle oil", "Top coat"], answer: 2 },
    ]
  },
  29: { // Everyday Makeup
    questions: [
      { q: "Which product opens up your eyes the most instantly?", options: ["Foundation", "Concealer", "Mascara", "Highlighter"], answer: 2 },
      { q: "Where should you match your foundation shade?", options: ["Your wrist", "Your forehead", "Your jaw", "Your hand"], answer: 2 },
      { q: "What is the #1 beginner makeup mistake?", options: ["Using too much mascara", "Not blending — harsh lines", "Wearing lip gloss", "Using a brush"], answer: 1 },
      { q: "Which affordable brand has everything under $15?", options: ["NARS", "Urban Decay", "e.l.f. Cosmetics", "Charlotte Tilbury"], answer: 2 },
      { q: "What must you do every single night?", options: ["Apply a face mask", "Remove ALL makeup", "Reapply moisturizer only", "Use a toner"], answer: 1 },
    ]
  },
  30: { // Power of Honesty
    questions: [
      { q: "What is the hardest kind of honesty?", options: ["Honesty with strangers", "Honesty with your parents", "Honesty with yourself", "Honesty at school"], answer: 2 },
      { q: "What do honest people build over time?", options: ["More conflicts", "More fake friendships", "Trust and lasting reputations", "Less success"], answer: 2 },
      { q: "What is the difference between honesty and harshness?", options: ["There is no difference", "Honesty is delivered with kindness; harshness is brutal", "Harshness is more effective", "Honesty means sugarcoating everything"], answer: 1 },
      { q: "Self-honesty means being able to do what?", options: ["Pretend everything is fine", "Admit when you're wrong and own your part in conflicts", "Avoid difficult conversations", "Only praise yourself"], answer: 1 },
      { q: "'The truth will set you free, but first it will make you ____.'" , options: ["Happy", "Popular", "Uncomfortable", "Rich"], answer: 2 },
    ]
  },
  31: { // Sororities & Greek Life
    questions: [
      { q: "What does NPHC stand for?", options: ["National Professional Honor Club", "National Pan-Hellenic Council", "New Panhellenic Community", "National Public Health Coalition"], answer: 1 },
      { q: "Which sorority is part of the Divine Nine?", options: ["Kappa Delta", "Alpha Chi Omega", "Alpha Kappa Alpha (ΑΚΑ)", "Zeta Tau Alpha"], answer: 2 },
      { q: "What GPA do most chapters require for membership?", options: ["1.0-2.0", "2.5-3.0+", "3.5+", "4.0 only"], answer: 1 },
      { q: "What should you research BEFORE committing to a sorority?", options: ["Who the most popular members are", "The national values and legacy of the organization", "How many parties they throw", "The dues structure only"], answer: 1 },
      { q: "What is real sisterhood built on?", options: ["Hazing traditions", "Mutual respect — NOT hazing", "Social media presence", "Exclusive events"], answer: 1 },
    ]
  },
  32: { // Car Maintenance
    questions: [
      { q: "How do you check your oil level?", options: ["Check the dashboard only", "Pull the dipstick, wipe it, reinsert, pull again", "Ask a mechanic", "Listen for engine sounds"], answer: 1 },
      { q: "Where do you find the correct tire pressure for your car?", options: ["On the tire sidewall", "On the door jamb sticker", "In the glove box only", "On the gas cap"], answer: 1 },
      { q: "How often should you get an oil change (synthetic oil)?", options: ["Every 1,000 miles", "Every 3,000 miles", "Every 7,500-10,000 miles", "Once a year regardless"], answer: 2 },
      { q: "What does it mean if the OIL warning light comes on?", options: ["Get it checked next week", "Add premium gas", "Stop driving and check oil immediately", "It's just a sensor glitch"], answer: 2 },
      { q: "What item in your emergency kit helps with a dead battery?", options: ["Fire extinguisher", "Emergency blanket", "Jumper cables", "Flashlight"], answer: 2 },
    ]
  },
  33: { // Healthy Eating
    questions: [
      { q: "Which nutrient is especially important for girls due to periods?", options: ["Vitamin C", "Iron", "Vitamin D", "Zinc"], answer: 1 },
      { q: "What should make up HALF your plate at every meal?", options: ["Protein", "Whole grains", "Vegetables and fruits", "Healthy fats"], answer: 2 },
      { q: "Are frozen vegetables as nutritious as fresh?", options: ["No, fresh is always better", "Yes — just as nutritious as fresh", "No, they have no vitamins", "Only if not frozen too long"], answer: 1 },
      { q: "How many glasses of water should you drink daily?", options: ["3-4 glasses", "5-6 glasses", "8-10 glasses", "12+ glasses"], answer: 2 },
      { q: "Which is a budget-friendly superfood?", options: ["Quinoa and chia seeds", "Acai bowls", "Avocado toast", "Eggs, oats, and beans"], answer: 3 },
    ]
  },
  34: { // Time Management
    questions: [
      { q: "What does the Eisenhower Matrix help you do?", options: ["Schedule your day by the hour", "Sort tasks by urgency and importance", "Track homework assignments", "Set financial goals"], answer: 1 },
      { q: "What is 'time blocking'?", options: ["Blocking social media apps", "Assigning specific activities to specific time blocks in your day", "Setting a timer for each task", "Blocking out distractions"], answer: 1 },
      { q: "What is the 2-minute rule?", options: ["Study for 2 minutes, then break", "If it takes less than 2 minutes, do it now", "Wait 2 minutes before responding", "Take 2-minute breaks every hour"], answer: 1 },
      { q: "When should you do your weekly planning?", options: ["Monday morning", "Every Sunday for 15 minutes", "Friday night", "Day by day — no planning needed"], answer: 1 },
      { q: "Girls who manage time well have ___ free time.", options: ["Less", "More", "The same amount", "No free time"], answer: 1 },
    ]
  },
};

export default QUIZZES;