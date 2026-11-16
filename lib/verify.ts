import { TailoredResume } from "./types";

/**
 * Faithfulness check (build.md section 7):
 * Lowercases original CV text and checks that every org, school,
 * and skill item in the output appears as a substring of it.
 * If something does not, removes that item and adds a note to gaps.
 */
export function verifyFaithfulness(
  cvText: string,
  tailored: TailoredResume
): TailoredResume {
  if (!tailored.resume) {
    return tailored;
  }

  const cvLower = cvText.toLowerCase();
  const gaps = [...(tailored.gaps || [])];
  const resume = { ...tailored.resume };

  // 1. Verify skills
  if (resume.skills && Array.isArray(resume.skills)) {
    resume.skills = resume.skills
      .map((cat) => {
        const verifiedItems = cat.items.filter((item) => {
          const match = cvLower.includes(item.trim().toLowerCase());
          if (!match && item.trim().length > 1) {
            gaps.push(`Removed unverified skill: ${item}`);
            return false;
          }
          return true;
        });
        return { ...cat, items: verifiedItems };
      })
      .filter((cat) => cat.items.length > 0);
  }

  // 2. Verify experience orgs
  if (resume.experience && Array.isArray(resume.experience)) {
    resume.experience = resume.experience.filter((exp) => {
      const match = cvLower.includes(exp.org.trim().toLowerCase());
      if (!match && exp.org.trim().length > 1) {
        gaps.push(`Removed unverified employer: ${exp.org}`);
        return false;
      }
      return true;
    });
  }

  // 3. Verify education schools
  if (resume.education && Array.isArray(resume.education)) {
    resume.education = resume.education.filter((edu) => {
      const match = cvLower.includes(edu.school.trim().toLowerCase());
      if (!match && edu.school.trim().length > 1) {
        gaps.push(`Removed unverified school: ${edu.school}`);
        return false;
      }
      return true;
    });
  }

  return {
    ...tailored,
    resume,
    gaps,
  };
}
