# FUNAAB Curriculum and Web Resource Research Report

## Findings, evidence quality, and how the research can bring FunaBAcer to life

**Prepared for:** FunaBAcer

**Prepared by:** Manus AI

**Research date:** 13 September 2026

## Executive conclusion

The research provides a strong foundation for turning FunaBAcer from a visually complete study application into a genuinely FUNAAB-aware learning system. The most valuable discovery is not a single complete curriculum handbook. It is a distributed evidence base made up of official admission records, college and department descriptions, course-synopsis pages, OpenCourseWare indexes, lecture notes, examination-question pages, academic calendars, institutional repository records, and independent student-navigation resources.

The official 2026/2027 FUNAAB admissions listing identifies **62 undergraduate programmes across eight academic domains**. The curriculum catalogue contains **91 unique source URLs**, including official programme pages, course-synopsis pages, admission documents, postgraduate context documents, and course-related PDFs. The web-resource survey identified **20 distinct direct PDF URLs** after deduplication and a separate index of **31 course titles or course synopses** exposed through public pages.

The evidence is sufficient to build a reliable first version of FunaBAcer’s course catalogue, onboarding logic, source-linked AI lessons, and document ingestion pipeline. It is not sufficient to claim that a complete current semester-by-semester undergraduate syllabus has been recovered for every programme. FunaBAcer should therefore use the research as a **verified knowledge layer with confidence labels**, not as permission to invent missing course units.

## 1. Scope and method

The research covered the official FUNAAB university website, official admission and postgraduate properties, public courseware and synopsis pages, public PDF files, the Nimbe Adedipe Library Institutional Repository, FUNAAB 101, and other independently discoverable FUNAAB-related resources. Public, unauthenticated pages were used. No login, paywall, robots restriction, upload workflow, or access-control mechanism was bypassed.

Sources were ranked by authority. Official university and admission sources were treated as primary evidence. Department and college pages were used for programme-level descriptions. Course-synopsis pages and lecture PDFs were treated as partial course-unit evidence. Postgraduate prospectuses were not treated as undergraduate curriculum handbooks. FUNAAB 101 was treated as an independent student guide rather than an official university record.

The research preserved uncertainty explicitly. A course title without a public synopsis was not converted into a fabricated description. An old lecture note was not presented as a current curriculum. A postgraduate specialization was not silently mapped to an undergraduate unit.

## 2. What was found

### 2.1 FUNAAB programme coverage

The official admissions listing provides the most useful starting point for FunaBAcer’s onboarding and course taxonomy. It identifies 62 programmes distributed across eight domains.

| Academic domain | Programmes | What this gives FunaBAcer |
|---|---:|---|
| Agriculture and crop/animal production | 23 | The largest catalogue branch, including crop science, animal science, environmental resources and agricultural management options |
| Biological sciences and public health | 7 | Life-science, biotechnology, microbiology, public-health and laboratory pathways |
| Computing and information systems | 7 | Computer science, cybersecurity, data, information and software pathways |
| Physical sciences | 6 | Chemistry, geophysics, industrial chemistry, mathematics, physics and statistics |
| Food science and human ecology | 5 | Food, nutrition, hospitality, clothing and home-science pathways |
| Engineering | 5 | Agricultural, civil, electrical, mechanical and mechatronic engineering |
| Veterinary medicine | 1 | A six-year professional Doctor of Veterinary Medicine pathway |
| Entrepreneurial, development and library studies | 8 | Business, finance, economics, entrepreneurship, development and information studies |
| **Total** | **62** | **A credible FUNAAB-specific onboarding and catalogue backbone** |

This data can replace the current generic course examples in FunaBAcer. After authentication, a student can select a FUNAAB academic domain and programme. The application can then load only the topics, documents, questions and recommendations relevant to that profile.

### 2.2 Programme-level synopses

Official department and college pages provide useful high-level descriptions for many programmes. These descriptions are suitable for onboarding, course landing pages, recommendation explanations and AI tutor context. Examples include the following:

| Programme area | Reliable research signal | Product use |
|---|---|---|
| Computer Science | Theory and practice, programming, software development, computing services, networking and hardware foundations | Generate a programme introduction and route students toward programming, systems and problem-solving modules |
| Cyber Security | Threat and risk analysis, cyber-fraud prevention, digital forensics, cryptography, security code and cyber defence | Create security-focused learning tracks and diagnostic question categories |
| Data Science | Data engineering, information extraction, big data, analytics, machine learning and AI | Build a data pathway with prerequisite checks for mathematics, statistics and programming |
| Food Science and Technology | Food composition, quality, processing, preservation, storage, packaging and food-industry systems | Generate food-processing topic maps and document collections |
| Engineering | Design, practical training, machinery, systems, materials, control and industrial application | Organise course pages around design, analysis, laboratory work and project practice |
| Veterinary Medicine | Twelve semesters, pre-professional, pre-clinical, para-clinical and clinical phases, field study and DVM award | Give Veterinary Medicine its own long-form professional progression rather than treating it like a four-year B.Sc. |
| Pure and Applied Zoology | Animal physiology, anatomy, genetics, ecology, public health, pest control and environmental applications | Create biology-to-agriculture connections and applied revision paths |
| Nutrition and Dietetics | Nutrient metabolism, assessment, public health, clinical nutrition, diet therapy, foodservice and nutrition education | Build health-focused topic clusters and document-based learning tasks |

These synopses should be stored as programme metadata. They should not be mistaken for a semester syllabus.

### 2.3 Course synopses and OpenCourseWare

The strongest course-level evidence comes from official FUNAAB course-synopsis pages and OpenCourseWare indexes. The research found detailed public synopses for selected courses including Agricultural Engineering, Physics, Forestry and Wildlife Management, Electrical Engineering, Mathematics, and several other areas.

Examples include **AGE 201 Engineering Drawing I**, covering drawing instruments, scales, lettering, geometrical drawing, dimensioning and projections; **AGE 303 Agricultural Land Surveying**, covering measurement, leveling, bearings, photogrammetry, remote sensing and GIS; **PHS 101 General Physics**, covering mechanics, gravitation, motion, fluids, heat and introductory thermodynamics; and **ELE 201 Applied Electricity I**, covering circuit elements, Kirchhoff’s laws, network theorems, transient response, semiconductors, rectification, electrostatics and capacitance.

These are highly valuable for FunaBAcer because they can become structured AI teaching units. A course synopsis can be transformed into a topic graph, prerequisite list, question-generation scope, flashcard seed set and lesson progression. The transformation must preserve the source link and confidence level.

### 2.4 PDFs and document resources

The public research identified 20 distinct direct PDF URLs. They include courseware, lecture notes, past questions, admission documents, academic calendars, policy documents and postgraduate materials.

The PDF inventory includes official FUNAAB OpenCourseWare files such as **CHM 101A**, **GNS 203**, **PHS 101**, **MTS 101F**, **Soil and Plant Analysis**, and **Controlled Breeding of Cattle, Sheep and Goats**. It also includes archival official past-question PDFs for animal science and food science, official admission requirements, academic calendars, ICT policy material, and postgraduate adverts.

The most important operational finding is that the PDFs are heterogeneous. Some are current or session-specific. Some are archival. Some are individual lecture notes. Some are examination papers. Some are policies. FunaBAcer therefore needs document metadata and lifecycle rules rather than a single undifferentiated PDF folder.

| Document class | Safe use in FunaBAcer | Required metadata |
|---|---|---|
| Official course synopsis | Seed topic map and AI lesson outline | Course code, title, source URL, date checked, confidence |
| Official lecture note | Retrieval context and document-grounded explanation | Course code, author if available, academic session, page range |
| Official past question | CBT practice and diagnostic assessment | Course code, year, question source, answer-verification status |
| Admission requirements | Onboarding and eligibility reference | Session, programme, admission source, expiry/review date |
| Academic calendar | Calendar feature and reminders | Session, event date, source URL, currentness |
| Postgraduate prospectus | Context only for related fields | Programme level, session, not undergraduate curriculum |
| Independent notes or student guide | Discovery and optional supplementary reference | Source owner, verification status, date checked, warning label |

## 3. What FUNAAB 101 contributes

FUNAAB 101 is useful because it models the student-facing information architecture around real campus needs. The public crawl covered academics, explore, resources, tools, freshers, past questions, course materials, groups, updates, student union information, college pages and PDF utilities. It also exposed pages for colleges such as COLPLANT, COLANIM, COLERM, COLENG, COLBIOS, COLPHYS, COLEND, COLFHEC and COLCOMPS.

Its greatest value to FunaBAcer is not verified course content. Its value is navigation and student context. It demonstrates that students need more than a list of courses. They need a clear path from college identity to academic information, study resources, past questions, tools, calendars and practical guidance.

The crawl did not find direct course PDFs hosted or linked by FUNAAB 101. Its public past-question and course-material pages were landing pages rather than exposed file repositories. The site itself is an independent student resource and advises users to verify official decisions with FUNAAB. FunaBAcer should therefore learn from its information architecture while keeping official university content visibly separate from independent guidance.

## 4. How the research can bring FunaBAcer to life

### 4.1 Make onboarding academically meaningful

The department-and-course onboarding already added to FunaBAcer can now be connected to the researched 62-programme catalogue. The selected programme should control the student’s initial course shelf, programme synopsis, recommended foundational topics and available source documents.

The onboarding profile should store the programme, academic domain, level, session, and optional semester. A student studying Mechanical Engineering should not receive the same default recommendations as a student studying Nutrition and Dietetics. A Veterinary Medicine student should see a professional six-year structure rather than a generic four-year progress bar.

### 4.2 Build a source-grounded AI tutor

The research makes it possible to constrain AI teaching to an approved source set. Each lesson should carry a source badge such as “Based on FUNAAB Physics course synopsis” or “Based on CHM 101 OpenCourseWare.” The tutor can explain, simplify, quiz, diagnose and reteach, but it should not silently claim that an inferred topic is an official course requirement.

A practical lesson record should contain a topic title, course code, programme, learning objectives, prerequisite topics, source excerpts, source URLs, confidence, generated explanation, question set, and last-reviewed date. This creates traceability between the AI answer and the underlying FUNAAB material.

### 4.3 Create a real Note Cruncher pipeline

The discovered PDFs show why Note Cruncher is central to the product. A student may upload a lecture note, course synopsis, past question or image of handwritten material. The system should extract text, identify course code and topic, create a summary, generate flashcards, create practice questions, and allow the student to ask questions against the uploaded document.

The upload flow should distinguish between user-owned documents and public reference documents. User-owned documents can be used in the student’s private study space. Public reference documents should retain source URL, authority, date, and confidence metadata.

### 4.4 Turn past questions into diagnosis, not only scoring

Past questions should be tagged by course, topic, difficulty, academic year, source quality and answer-verification status. A question should not enter the official practice bank merely because it was found on an independent site. It should first be marked as unverified or reviewed by an administrator.

The learning loop can then use wrong answers to diagnose specific gaps. For example, a wrong response to a Boyle’s law question can lead to a short explanation of inverse relationships, a simpler worked example, a similar question, and a retest. The research provides the course and topic taxonomy needed to make this diagnosis meaningful.

### 4.5 Add a document and source governance layer

FunaBAcer should implement a source registry rather than saving URLs as plain text. Each source should have an authority class, host, document type, academic level, session, checked date, content hash, review status, and programme/course mapping.

This matters because the research encountered duplicate URLs, archival documents, naming variants, postgraduate material, and programme titles with limited public evidence. A governance layer prevents the AI from turning old or unrelated documents into current curriculum facts.

## 5. Recommended implementation sequence

| Phase | Product work | Evidence required | Result |
|---|---|---|---|
| 1 | Import the 62-programme catalogue | Official 2026 admissions listing and programme metadata | Accurate onboarding and course shelves |
| 2 | Add source registry and confidence labels | 91 unique research URLs and document classifications | Traceable content provenance |
| 3 | Ingest high-confidence course synopses | Official course-synopsis pages and OpenCourseWare | Initial topic maps and AI lesson seeds |
| 4 | Add PDF extraction and document Q&A | Direct PDF inventory plus user uploads | Working Note Cruncher |
| 5 | Build reviewed CBT question bank | Official past-question files and verified answer keys | Reliable practice and diagnosis |
| 6 | Add mastery and recommendation logic | Attempts, topic tags, confidence and profile data | Personalised next lessons |
| 7 | Add independent resource layer | FUNAAB 101 and other student guides | Campus guidance without confusing authority |
| 8 | Establish content review workflow | Current session checks and administrator review | Safe, maintainable academic content |

## 6. Important limitations

The research did not recover a complete current undergraduate semester-by-semester syllabus for all 62 programmes. This is the most important limitation. Programme pages describe aims and scope, but they do not establish every course code, unit value, semester, prerequisite, assessment method or current departmental sequence.

Several public PDFs are archival. A document hosted on an official FUNAAB domain is not automatically current. Admission requirements and academic calendars are session-sensitive. Postgraduate prospectuses are not undergraduate curriculum evidence. Individual lecture notes are not complete degree programmes.

Some programme names and administrative homes require verification. Geophysics, Industrial Chemistry, Water Sanitation and Hygiene, and several newly approved programmes have stronger admission-list evidence than detailed public curriculum evidence. FunaBAcer should display a conservative “curriculum details are being verified” state rather than inventing missing descriptions.

Independent resources can be valuable while remaining unofficial. FUNAAB 101 and CropPSA can help discover student needs and possible resource leads. They should not override official university sources or be presented as official FUNAAB policy.

## 7. Final recommendation

FunaBAcer should proceed with a **source-grounded curriculum beta**. The beta should launch with the full 62-programme taxonomy, programme-level descriptions, selected high-confidence course synopses, a curated subset of official PDFs, and clearly labelled gaps. It should not wait for a perfect handbook that may not be publicly available.

The product’s differentiator should be the connection between source material and adaptive teaching. The student should be able to move from a FUNAAB course, to a topic, to a source-backed explanation, to a question, to an AI diagnosis, to a simplified explanation, and back to a retest. The research now provides the academic structure and source discipline required to make that loop credible.

## References

[1]: https://admission.funaab.edu.ng/2026/programmes.php "FUNAAB 2026/2027 Available Programmes"
[2]: https://funaab.edu.ng/ "Federal University of Agriculture, Abeokuta official website"
[3]: https://funaab.edu.ng/funaab-opencourseware/ "FUNAAB OpenCourseWare"
[4]: https://funaab.edu.ng/phs-course-synopsis/ "FUNAAB Physics Course Synopsis"
[5]: https://funaab.edu.ng/age-course-synopsis/ "FUNAAB Agricultural Engineering Course Synopsis"
[6]: https://funaab.edu.ng/ele-course-synopsis/ "FUNAAB Electrical and Electronics Engineering Course Synopsis"
[7]: https://funaab.edu.ng/fwm-course-synopsis/ "FUNAAB Forestry and Wildlife Management Course Synopsis"
[8]: https://funaab.edu.ng/communication-a-general-studies-course-notes/ "FUNAAB Communication and General Studies Course Notes"
[9]: https://admission.funaab.edu.ng/2026/files/FUNAABAdmissionRequirements.pdf "FUNAAB Admission Requirements 2026"
[10]: https://funaab.edu.ng/funaab-ocw/opencourseware/CHM%20101A.pdf "FUNAAB CHM 101A OpenCourseWare PDF"
[11]: https://funaab.edu.ng/funaab-ocw/opencourseware/PHS%20101.pdf "FUNAAB PHS 101 OpenCourseWare PDF"
[12]: https://funaab.edu.ng/wp-content/uploads/2009/12/460_ANP%20201%20PAST%20QUESTIONS%202006.pdf "FUNAAB ANP 201 Past Questions PDF"
[13]: https://funaab.edu.ng/wp-content/uploads/publications/202526_Academic_calendar.pdf "FUNAAB Academic Calendar 2025/2026"
[14]: https://ir.funaab.edu.ng/ "Nimbe Adedipe Library Institutional Repository"
[15]: https://www.funaab101.xyz/ "FUNAAB 101 independent student guide"
[16]: https://www.funaab101.xyz/course-materials "FUNAAB 101 course materials landing page"
[17]: https://www.funaab101.xyz/past-questions "FUNAAB 101 past questions landing page"
[18]: http://croppsa.blogspot.com/p/my-notes.html "CropPSA independent course notes index"
[19]: https://funaab.edu.ng/mechanical-engineering-courses/ "FUNAAB Mechanical Engineering Courses"
[20]: https://funaab.edu.ng/college-of-veterinary-medicine-70849736/department-of-veterinary-medicine-a-surgery/ "FUNAAB Veterinary Medicine and Surgery"
[21]: https://funaab.edu.ng/college-of-food-sciences-and-human-ecology-colfhec/hospitality-and-tourism/ "FUNAAB Hospitality and Tourism"
[22]: https://funaab.edu.ng/section/department-of-cyber-security-and-data-science/ "FUNAAB Cyber Security and Data Science"
[23]: https://funaab.edu.ng/section/department-of-software-engineering-and-information-system/ "FUNAAB Software Engineering and Information System"
[24]: https://funaab.edu.ng/section/college-of-engineering/ "FUNAAB College of Engineering"
[25]: https://funaab.edu.ng/section/college-of-biosciences/ "FUNAAB College of Biosciences"
[26]: https://funaab.edu.ng/section/college-of-plant-science-and-crop-production/ "FUNAAB College of Plant Science and Crop Production"
[27]: https://funaab.edu.ng/section/college-of-environmental-resources-management/ "FUNAAB College of Environmental Resources Management"
[28]: https://funaab.edu.ng/wp-content/uploads/2010/11/1538_College%20of%20Engineering%20(COLENG)%20%5BPostgraduate%20Prospectus%5D.pdf "FUNAAB College of Engineering Postgraduate Prospectus"
[29]: https://pg.unaab.edu.ng/files/Advert_PG_20252026.pdf "FUNAAB Postgraduate Advert 2025/2026"
[30]: https://funaab.edu.ng/funaab-ocw/opencourseware/GNS%20203.pdf "FUNAAB GNS 203 OpenCourseWare PDF"
[31]: https://funaab.edu.ng/wp-content/uploads/2009/12/475_mts%20101F%20lecture%20%20note.pdf "FUNAAB MTS 101F Lecture Note"
[32]: https://funaab.edu.ng/fst-examination-questions/ "FUNAAB Food Science and Technology Examination Questions"
[33]: https://funaab.edu.ng/computer-past-questions/ "FUNAAB Computer Past Questions"
[34]: https://funaab.edu.ng/funaab-ocw/opencourseware/Soil%20and%20Plant%20Analysis.pdf "FUNAAB Soil and Plant Analysis OpenCourseWare PDF"
[35]: https://funaab.edu.ng/funaab-ocw/opencourseware/Controlled%20Breeding%20of%20Cattle,%20Sheep%20and%20Goats.pdf "FUNAAB Controlled Breeding OpenCourseWare PDF"
[36]: https://funaab.edu.ng/wp-content/uploads/2011/02/3112_500levelfstpq.pdf "FUNAAB Food Science 500-Level Past Questions PDF"
[37]: https://funaab.edu.ng/wp-content/uploads/2020/08/Funnabictpolicy.pdf "FUNAAB ICT Policy PDF"
[38]: https://funaab.edu.ng/wp-content/uploads/2020/09/Research-Ethics-FUNAAB-RV3.pdf "FUNAAB Research Ethics Policy PDF"
[39]: https://funaab.edu.ng/wp-content/uploads/2020/08/FUNAAB-Policy-on-Research-reduced.pdf "FUNAAB Policy on Research PDF"
[40]: https://funaab.edu.ng/opencourseware/ "FUNAAB OpenCourseWare Index"
[41]: https://funaab.edu.ng/mathematics-lecture-notes/ "FUNAAB Mathematics Lecture Notes"
[42]: https://funaab.edu.ng/physics-lecture-notes/ "FUNAAB Physics Lecture Notes"
[43]: https://funaab.edu.ng/chemistry-lecture-notes/ "FUNAAB Chemistry Lecture Notes"
[44]: https://funaab.edu.ng/section/college-of-entrepreneurial-and-development-studies/ "FUNAAB College of Entrepreneurial and Development Studies"
[45]: https://funaab.edu.ng/section/home-science-and-management/ "FUNAAB Home Science and Management"
[46]: https://funaab.edu.ng/section/department-of-food-science-and-technology/ "FUNAAB Department of Food Science and Technology"
[47]: https://funaab.edu.ng/section/department-of-mathematics/ "FUNAAB Department of Mathematics"
[48]: https://funaab.edu.ng/section/department-of-physics/ "FUNAAB Department of Physics"
[49]: https://funaab.edu.ng/section/department-of-statistics/ "FUNAAB Department of Statistics"
[50]: https://funaab.edu.ng/section/college-of-computing-sciences/ "FUNAAB College of Computing Sciences"
[51]: https://funaab.edu.ng/section/department-of-pure-and-applied-botany/ "FUNAAB Department of Pure and Applied Botany"
[52]: https://funaab.edu.ng/section/department-of-nutrition-and-dietetics/ "FUNAAB Department of Nutrition and Dietetics"
[53]: https://funaab.edu.ng/section/agricultural-and-bioresources-engineering/ "FUNAAB Agricultural and Bioresources Engineering"
[54]: https://funaab.edu.ng/section/college-of-veterinary-medicine/ "FUNAAB College of Veterinary Medicine"
[55]: https://funaab.edu.ng/funaab101.xyz "FUNAAB 101 domain reference"

## Source files used for this report

The detailed machine-readable research files are preserved alongside this report:

- `FUNAAB-curriculum-catalogue.md` — 62-programme evidence catalogue.
- `funabacer-curriculum-manifest.json` — structured programme manifest.
- `funaab-web-resource-index.md` — web-source and PDF index.
- `01-agriculture.md` through `08-management.md` — domain reports.
- `web-01-funaab101.md` through `web-03-other.md` — web-resource reports.
