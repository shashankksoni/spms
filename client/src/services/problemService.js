import axios from 'axios';

export const getAcceptedProblems = async (handle) => {
  try {
    const res = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );

    const submissions = res.data.result;

    const uniqueProblems = new Map();

    submissions.forEach((sub) => {
      if (sub.verdict === 'OK' && sub.problem) {
        const id = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!uniqueProblems.has(id)) {
          uniqueProblems.set(id, {
            rating: sub.problem.rating || 0,
            date: new Date(sub.creationTimeSeconds * 1000),
            name: `${sub.problem.name} (${sub.problem.contestId}-${sub.problem.index})`,
          });
        }
      }
    });

    return Array.from(uniqueProblems.values());
  } catch (err) {
    console.error("Error fetching submissions:", err.message);
    return [];
  }
};
