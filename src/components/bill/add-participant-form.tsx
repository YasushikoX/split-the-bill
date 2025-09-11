'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name cannot be empty.',
  }),
});

type AddParticipantFormProps = {
  addParticipant: (name: string) => void;
};

export function AddParticipantForm({ addParticipant }: AddParticipantFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    addParticipant(data.name);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="Participant's Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" aria-label="Add Participant">
            <UserPlus />
        </Button>
      </form>
    </Form>
  );
}
