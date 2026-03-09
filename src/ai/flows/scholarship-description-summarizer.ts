'use server';
/**
 * @fileOverview A Genkit flow to summarize scholarship descriptions into concise bullet points,
 * highlighting key eligibility criteria and requirements.
 *
 * - summarizeScholarshipDescription - A function that handles the scholarship description summarization process.
 * - ScholarshipDescriptionSummarizerInput - The input type for the summarizeScholarshipDescription function.
 * - ScholarshipDescriptionSummarizerOutput - The return type for the summarizeScholarshipDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScholarshipDescriptionSummarizerInputSchema = z.object({
  scholarshipDescription: z.string().describe('The full scholarship description text to be summarized.'),
});
export type ScholarshipDescriptionSummarizerInput = z.infer<typeof ScholarshipDescriptionSummarizerInputSchema>;

const ScholarshipDescriptionSummarizerOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the scholarship description in bullet points, highlighting key eligibility criteria and requirements.'),
});
export type ScholarshipDescriptionSummarizerOutput = z.infer<typeof ScholarshipDescriptionSummarizerOutputSchema>;

const scholarshipDescriptionSummarizerPrompt = ai.definePrompt({
  name: 'scholarshipDescriptionSummarizerPrompt',
  input: { schema: ScholarshipDescriptionSummarizerInputSchema },
  output: { schema: ScholarshipDescriptionSummarizerOutputSchema },
  prompt: `You are an AI assistant specialized in summarizing scholarship information.

Summarize the following scholarship description into concise bullet points. Focus specifically on key eligibility criteria and requirements. Ensure the summary is easy to read and understand quickly.

Scholarship Description:
{{{scholarshipDescription}}}`,
});

const scholarshipDescriptionSummarizerFlow = ai.defineFlow(
  {
    name: 'scholarshipDescriptionSummarizerFlow',
    inputSchema: ScholarshipDescriptionSummarizerInputSchema,
    outputSchema: ScholarshipDescriptionSummarizerOutputSchema,
  },
  async (input) => {
    const { output } = await scholarshipDescriptionSummarizerPrompt(input);
    return output!;
  }
);

export async function summarizeScholarshipDescription(input: ScholarshipDescriptionSummarizerInput): Promise<ScholarshipDescriptionSummarizerOutput> {
  return scholarshipDescriptionSummarizerFlow(input);
}
