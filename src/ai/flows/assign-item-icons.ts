'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically assigning icons to bill items based on their names.
 *
 * @exports assignItemIcons - An async function that takes an item name and returns a data URI representing an icon.
 * @exports AssignItemIconsInput - The input type for the assignItemIcons function.
 * @exports AssignItemIconsOutput - The return type for the assignItemIcons function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignItemIconsInputSchema = z.object({
  itemName: z
    .string()
    .describe('The name of the bill item for which to assign an icon.'),
});
export type AssignItemIconsInput = z.infer<typeof AssignItemIconsInputSchema>;

const AssignItemIconsOutputSchema = z.object({
  iconDataUri: z
    .string()
    .describe(
      'A data URI representing the assigned icon, or null if no relevant icon could be determined.'
    )
    .nullable(),
});
export type AssignItemIconsOutput = z.infer<typeof AssignItemIconsOutputSchema>;

export async function assignItemIcons(input: AssignItemIconsInput): Promise<AssignItemIconsOutput> {
  return assignItemIconsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assignItemIconsPrompt',
  input: {schema: AssignItemIconsInputSchema},
  output: {schema: AssignItemIconsOutputSchema},
  prompt: `You are an assistant that assigns icons to bill items based on their names.

  Given the item name, suggest a relevant icon as a data URI. If no relevant icon can be determined, return null.

  Item Name: {{{itemName}}}
  `,
});

const assignItemIconsFlow = ai.defineFlow(
  {
    name: 'assignItemIconsFlow',
    inputSchema: AssignItemIconsInputSchema,
    outputSchema: AssignItemIconsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
