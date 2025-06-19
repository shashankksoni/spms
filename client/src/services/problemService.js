import axios from 'axios';

export const getAcceptedProblems = async (handle) => {
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`
    );

    const submissions = response.data.result;

    const solvedMap = new Map();

    submissions.forEach(sub => {
      if (sub.verdict === 'OK' && sub.problem) {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedMap.has(problemId)) {
          solvedMap.set(problemId, {
            rating: sub.problem.rating || 0,
            date: new Date(sub.creationTimeSeconds * 1000)
          });
        }
      }
    });

    return Array.from(solvedMap.values());
  } catch (error) {
    console.error('Error fetching problem submissions:', error);
    return [];
  }
};
