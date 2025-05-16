const sidebarButtons = [
  {
    title: "cases",
    icon: "/assets/dashboard/AllClaims.svg",
    selected: false,
    router: "cases",
  },
  //   {
  //   title: "case",
  //   icon: "/assets/dashboard/AllClaims.svg",
  //   selected: false,
  //   router: "case",
  // },
  {
    title: "settings",
    icon: "/assets/dashboard/settings.svg",
    selected: false,
    router: "settings",
  },
  {
    title: "Help and feedback",
    icon: "/assets/dashboard/techsupport.svg",
    selected: false,
    router: "help-and-feedback",
  },
  // {
  //   title: "overview",
  //   icon: "/assets/dashboard/Dashboard.svg",
  //   selected: true,
  //   router: "overview",
  // },
  // {
  //   title: "splitting",
  //   icon: "/assets/dashboard/Inbox.svg",
  //   selected: false,
  //   router: "splitting",
  // },
  // {
  //   title: "tasks",
  //   icon: "/assets/dashboard/techsupport.svg",
  //   selected: false,
  //   router: "tasks",
  // },
];

const keywords = [
  "AI",
  "Machine Learning",
  "Neural Networks",
  "Deep Learning",
  "Automation",
  "Cloud Computing",
  "AWS",
  "Azure",
  "GCP",
  "Serverless",
  "IoT",
  "Internet of Things",
  "Sensors",
  "Edge Computing",
  "Devices",
  "Blockchain",
  "Cryptocurrency",
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "Big Data",
  "Analytics",
  "Data Science",
  "Hadoop",
  "Spark",
  "Cybersecurity",
  "Encryption",
  "Malware",
  "Firewall",
  "Phishing",
  "Quantum Computing",
  "Qubits",
  "Entanglement",
];

const documentOfInterest = ["Medical Report"];

const dateOfinterest = [
  "Date of visit",
  "Date of Birth",
  "Date of Service",
  "DOS",
  "Evaluation Date",
  "Date of Injury",
  "Date of Accident",
  "Date of Summary",
];

const yearOfInterest = ["2024", "2023", "2022", "2021"];

const cases = [
  {
    name: "Murphy Cutis",
    date: "July 10th, 2021 at 2:55PM",
  },
  {
    name: "Martha Hildebrand",
    date: "July 10th, 2021 at 2:55PM",
  },
  {
    name: "Steven R Green",
    date: "July 10th, 2021 at 2:55PM",
  },
];

const excelSheetKeyWords = ["Provider", "Amount"];
export {
  sidebarButtons,
  keywords,
  documentOfInterest,
  dateOfinterest,
  yearOfInterest,
  cases,
  excelSheetKeyWords,
};
