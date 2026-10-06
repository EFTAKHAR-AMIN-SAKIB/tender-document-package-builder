export const bn = {
  // App
  appName: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
  appSubtitle: 'অফিসিয়াল দরপত্র নথি সংকলন ও যাচাইকরণ ইঞ্জিন',
  tagline: 'দরপত্র দাখিলের জন্য ব্রাউজার-ভিত্তিক নিরাপদ নথি প্রক্রিয়াকরণ',

  // Language
  language: 'ভাষা',
  english: 'English',
  bangla: 'বাংলা',

  // Steps / Workflow
  step1: '১. রিকোয়ারমেন্ট লোড',
  step2: '২. পিডিএফ আপলোড',
  step3: '৩. নথি ম্যাপিং',
  step4: '৪. প্যাকেজ তৈরি',

  // Tender Info Card
  tenderDetails: 'দরপত্রের বিবরণ',
  tenderId: 'টেন্ডার আইডি',
  tenderTitle: 'টেন্ডার শিরোনাম',
  procuringEntity: 'দরপত্র আহ্বানকারী সংস্থা',
  bidder: 'দরদাতা প্রতিষ্ঠান',
  submissionDeadline: 'জমার শেষ তারিখ',
  loadSampleTender: 'নমুনা টেন্ডার প্যাক লোড করুন',
  reloadRequirements: 'নতুন রিকোয়ারমেন্ট ফাইল দিন',

  // Requirements Loader
  loadRequirementsTitle: 'রিকোয়ারমেন্ট ফাইল লোড করুন',
  loadRequirementsDesc: 'দরপত্র আহ্বানকারী সংস্থা থেকে প্রাপ্ত অফিশিয়াল requirements.json ফাইলটি প্রদান করুন।',
  dragDropJson: 'requirements.json ফাইলটি এখানে টেনে এনে ছাড়ুন, অথবা ব্রাউজ করুন',
  clickToBrowse: 'কম্পিউটার থেকে খুঁজুন',
  orUseSample: 'অথবা সরাসরি প্রস্তুত নমুনা দিয়ে পরীক্ষা করুন:',
  loadSample1: 'আইটি যন্ত্রপাতি সরবরাহ টেন্ডার (৬টি নথি)',
  loadSample2: 'অবকাঠামো নির্মাণ টেন্ডার (৮টি নথি)',
  jsonErrorTitle: 'রিকোয়ারমেন্ট ফাইলের ত্রুটি',

  // Upload Zone
  uploadPdfsTitle: 'দরপত্রের পিডিএফ ফাইলসমূহ আপলোড করুন',
  uploadPdfsDesc: 'সর্বোচ্চ ৩০টি পিডিএফ ফাইল নির্বাচন করুন (মোট আকার সর্বোচ্চ ৫০ মেগাবাইট)। সমস্ত যাচাইকরণ আপনার ব্রাউজারেই সম্পন্ন হয়।',
  dragDropPdfs: 'পিডিএফ ফাইলগুলো এখানে টেনে এনে ছাড়ুন, অথবা ক্লিক করুন',
  uploadLimitNotice: 'কেবল পিডিএফ গ্রহণযোগ্য • সর্বোচ্চ ৩০টি ফাইল • মোট ৫০ মেগাবাইট',
  totalFiles: 'মোট ফাইল',
  totalSize: 'মোট সাইজ',
  clearAllFiles: 'সব ফাইল মুছুন',

  // Uploaded Files List
  uploadedFilesTitle: 'আপলোডকৃত নথির তালিকা',
  noFilesUploaded: 'এখনও কোনো পিডিএফ ফাইল আপলোড করা হয়নি। ম্যাপিং শুরু করতে ফাইল আপলোড করুন।',
  pages: 'পৃষ্ঠা',
  duplicateBadge: 'ডুপ্লিকেট ফাইল',
  duplicateNotice: 'একই নথির হুবহু প্রতিলিপি শনাক্ত হয়েছে ({name}-এর অনুরূপ)। একই নথির প্রতিলিপি একাধিক স্থানে যুক্ত করা যাবে না।',
  corruptedFile: 'ব্যবহার অনুপযোগী পিডিএফ',
  removeFile: 'মুছুন',
  matchedTo: 'যুক্ত রয়েছে',
  unmatched: 'অব্যবহৃত',

  // Matching Table
  documentChecklist: 'নথি যাচাইকরণ ও ম্যাপিং চেকলিস্ট',
  matchingDesc: 'প্রতিটি রিকোয়ারমেন্টের বিপরীতে প্রয়োজনীয় পিডিএফ সংযুক্ত করুন। নথিগুলো নির্ধারিত ক্রম অনুসারে সাজানো হয়েছে।',
  colOrder: 'ক্রম',
  colRequirement: 'প্রয়োজনীয় নথি',
  colType: 'ধরন',
  colMatchedFile: 'সংযুক্ত ফাইল',
  colExpiryDate: 'মেয়াদ উত্তীর্ণের তারিখ',
  colStatus: 'অবস্থা',
  colActions: 'পদক্ষেপ',
  mandatory: 'বাধ্যতামূলক',
  optional: 'ঐচ্ছিক',
  expiryRequired: 'মেয়াদ যাচাই প্রযোজ্য',
  noExpiryNeeded: 'মেয়াদ যাচাই প্রয়োজন নেই',
  selectFilePlaceholder: '— আপলোডকৃত পিডিএফ নির্বাচন করুন —',
  unassignFile: 'সংযোগ বাতিল',
  enterExpiryDate: 'মেয়াদ উত্তীর্ণের তারিখ দিন',
  expiryDeadlineNotice: 'জমার শেষ তারিখ ({date}) বা তার পরবর্তী হতে হবে',
  autoMatchBtn: 'স্বয়ংক্রিয় ম্যাচিং',
  autoMatchApplied: 'ফাইলের নামের ওপর ভিত্তি করে {count}টি নথি স্বয়ংক্রিয়ভাবে যুক্ত করা হয়েছে।',
  clearAllMatches: 'সব সংযোগ মুছুন',

  // Statuses
  status_missing: 'অনুপস্থিত',
  status_missing_desc: 'বাধ্যতামূলক নথিটি সংযুক্ত করা হয়নি।',
  status_expiry_needed: 'মেয়াদ দেওয়া প্রয়োজন',
  status_expiry_needed_desc: 'এই নথির মেয়াদ উত্তীর্ণের তারিখ দিতে হবে।',
  status_expired: 'মেয়াদোত্তীর্ণ',
  status_expired_desc: 'নথির মেয়াদ টেন্ডার জমার শেষ তারিখের পূর্বেই শেষ হয়েছে।',
  status_not_provided: 'সরবরাহ করা হয়নি',
  status_not_provided_desc: 'ঐচ্ছিক নথি সংযুক্ত করা হয়নি (প্যাকেজে অন্তর্ভুক্ত হবে না)।',
  status_ok: 'সঠিক ও যাচাইকৃত',
  status_ok_desc: 'নথিটি যাচাই সম্পন্ন এবং প্রস্তুত।',

  // Package Generation
  generateSectionTitle: 'চূড়ান্ত প্যাকেজ তৈরি',
  generateBtn: 'দরপত্র প্যাকেজ পিডিএফ তৈরি করুন',
  generatingBtn: 'পিডিএফ সংকলন করা হচ্ছে...',
  downloadBtn: 'প্যাকেজ ডাউনলোড ({fileName})',
  blockedTitle: 'প্যাকেজ তৈরি স্থগিত রয়েছে',
  blockedDesc: 'চূড়ান্ত দরপত্র প্যাকেজ তৈরির পূর্বে নিচের সমস্যাগুলো সমাধান করা আবশ্যক:',
  readyToGenerate: 'সকল বাধ্যতামূলক নথি এবং মেয়াদোত্তীর্ণের তারিখ সফলভাবে যাচাই করা হয়েছে! চূড়ান্ত প্যাকেজ তৈরির জন্য প্রস্তুত।',
  includeIndexPage: 'সূচিপত্র / ইনডেক্স পৃষ্ঠা অন্তর্ভুক্ত করুন (বোনাস)',
  exportChecklistCsv: 'চেকলিস্ট CSV হিসেবে রপ্তানি করুন',
  exportChecklistExcel: 'চেকলিস্ট এক্সপোর্ট',
  saveSession: 'সেশন সংরক্ষণ',
  loadSession: 'সংরক্ষিত সেশন খুলুন',

  // Success Modal / Screen
  packageReadyTitle: 'দরপত্র প্যাকেজ সফলভাবে তৈরি হয়েছে!',
  packageReadyDesc: 'দরপত্রের সকল নিয়মাবলি ও নির্দেশিকা অনুসরণ করে আপনার দরপত্র ডসিয়ার সংকলিত হয়েছে।',
  summaryTotalPages: 'মোট পৃষ্ঠা সংখ্যা',
  summaryIncludedDocs: 'অন্তর্ভুক্ত নথি',
  summaryFilename: 'ফাইলের নাম',
  coverPageNotice: 'প্রথম পৃষ্ঠায় নিয়ম অনুসারে অফিশিয়াল ইংরেজি কভার ও সূচি তৈরি হয়েছে। সকল পৃষ্ঠায় ফুটার ও পৃষ্ঠা নম্বর সংযুক্ত হয়েছে।',
  downloadNow: 'পিডিএফ প্যাকেজ ডাউনলোড করুন',

  // Errors & Warnings
  fileLimitExceeded: 'সর্বোচ্চ ফাইলের সীমা অতিক্রম করেছে: সর্বোচ্চ ৩০টি ফাইল অনুমোদিত।',
  sizeLimitExceeded: 'ফাইলের মোট আকারের সীমা অতিক্রম করেছে: সর্বোচ্চ ৫০ মেগাবাইট অনুমোদিত।',
  invalidFileExtension: 'নন-পিডিএফ ফাইল প্রত্যাখ্যাত: {name}। কেবল পিডিএফ নথি গ্রহণযোগ্য।',
  duplicateAssignmentBlocked: 'হুবহু একই কনটেন্টযুক্ত ডুপ্লিকেট ফাইল ভিন্ন ভিন্ন নথিতে যুক্ত করা যাবে না।',
  fileAlreadyAssigned: 'এই ফাইলটি ইতোমধ্যেই অন্য একটি নথিতে যুক্ত করা হয়েছে।',
  errorProcessingFile: '{name} প্রক্রিয়াকরণে ত্রুটি: {reason}',

  // Footer & Help
  browserPrivacyNotice: '১০০% ক্লায়েন্ট-সাইড প্রসেসিং • আপনার সংবেদনশীল নথি ব্রাউজারের বাইরে কখনোই পাঠানো হয় না',
  helpTitle: 'ব্যবহার নির্দেশিকা',
  helpWorkflow: '১. রিকোয়ারমেন্ট JSON লোড করুন → ২. পিডিএফ আপলোড করুন → ৩. নথি সংযুক্ত করুন → ৪. মেয়াদের তারিখ দিন → ৫. প্যাকেজ তৈরি ও ডাউনলোড করুন।',
};
