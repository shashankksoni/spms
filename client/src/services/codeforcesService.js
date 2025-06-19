import axios from 'axios';

export const getContestHistory = async (handle) => {
  try {
    const res = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    return res.data.result.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds,
      problemsUnsolved: 0 // placeholder
    }));
  } catch (err) {
    console.error('Error fetching contest history:', err.message);
    return [];
  }
};

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
