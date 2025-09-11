'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
});

type AddItemFormProps = {
  addItem: (name: string, price: number) => void;
  disabled: boolean;
};

export function AddItemForm({ addItem, disabled }: AddItemFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', price: '' as any },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    addItem(data.name, data.price);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Add New Item</CardTitle>
        <CardDescription>
          {disabled ? 'Add participants before adding items.' : 'Enter item details below.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-start gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full md:flex-grow">
                  <FormControl>
                    <Input placeholder="e.g., Pizza, Drinks" {...field} disabled={disabled} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full md:w-40">
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" step="0.01" placeholder="Price" className="pl-6" {...field} value={field.value ?? ''} disabled={disabled} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto" disabled={disabled}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
