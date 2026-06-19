const Question = require('../models/Question');

/**
 * Shuffle an array randomly (Fisher-Yates algorithm)
 */
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Pick `count` random questions from a pool, avoiding ones already used in other sets
 * (so each set has different questions where possible)
 */
const pickRandomQuestions = (pool, count, excludeIds = []) => {
  const available = pool.filter((q) => !excludeIds.includes(q._id.toString()));
  const sourcePool = available.length >= count ? available : pool; // fallback if not enough unique questions
  const shuffled = shuffleArray(sourcePool);
  return shuffled.slice(0, count);
};

/**
 * Core function: generate one randomized set based on section rules and difficulty mix
 *
 * sections example:
 * [
 *   { sectionName: 'Section A', questionType: 'MCQ', numberOfQuestions: 10, marksPerQuestion: 2 },
 *   { sectionName: 'Section B', questionType: 'ShortAnswer', numberOfQuestions: 5, marksPerQuestion: 5 },
 * ]
 *
 * difficultyMix example: { easy: 30, medium: 50, hard: 20 } (percentages)
 */
const generateOneSet = async (subject, sections, difficultyMix, excludeIds = []) => {
  let allSelectedQuestions = [];

  for (const section of sections) {
    const { questionType, numberOfQuestions } = section;

    // Fetch all approved questions matching subject + type
    const candidatePool = await Question.find({
      subject,
      questionType,
      status: 'Approved',
    });

    if (candidatePool.length === 0) {
      throw new Error(
        `No approved questions found for subject "${subject}" and type "${questionType}". Add and approve more questions first.`
      );
    }

    // Calculate how many easy/medium/hard questions are needed for this section
    const easyCount = Math.round((difficultyMix.easy / 100) * numberOfQuestions);
    const mediumCount = Math.round((difficultyMix.medium / 100) * numberOfQuestions);
    let hardCount = numberOfQuestions - easyCount - mediumCount;
    if (hardCount < 0) hardCount = 0;

    const easyPool = candidatePool.filter((q) => q.difficulty === 'Easy');
    const mediumPool = candidatePool.filter((q) => q.difficulty === 'Medium');
    const hardPool = candidatePool.filter((q) => q.difficulty === 'Hard');

    let selected = [
      ...pickRandomQuestions(easyPool, easyCount, excludeIds),
      ...pickRandomQuestions(mediumPool, mediumCount, excludeIds),
      ...pickRandomQuestions(hardPool, hardCount, excludeIds),
    ];

    // If difficulty pools didn't have enough questions, top up from the whole candidate pool
    if (selected.length < numberOfQuestions) {
      const stillNeeded = numberOfQuestions - selected.length;
      const usedIds = selected.map((q) => q._id.toString());
      const topUp = pickRandomQuestions(candidatePool, stillNeeded, [...excludeIds, ...usedIds]);
      selected = [...selected, ...topUp];
    }

    allSelectedQuestions = [...allSelectedQuestions, ...selected.slice(0, numberOfQuestions)];
  }

  return allSelectedQuestions;
};

/**
 * Generate multiple sets (Set A, B, C, D...) for the same pattern
 * Each set tries to use different questions from the others
 */
const generateMultipleSets = async (subject, sections, difficultyMix, numberOfSets) => {
  const setLabels = ['Set A', 'Set B', 'Set C', 'Set D', 'Set E', 'Set F'];
  const sets = [];
  let usedQuestionIds = [];

  for (let i = 0; i < numberOfSets; i++) {
    const questions = await generateOneSet(subject, sections, difficultyMix, usedQuestionIds);
    const questionIds = questions.map((q) => q._id);

    sets.push({
      setName: setLabels[i] || `Set ${i + 1}`,
      questions: questionIds,
    });

    usedQuestionIds = [...usedQuestionIds, ...questionIds.map((id) => id.toString())];
  }

  return sets;
};

module.exports = { generateMultipleSets };
