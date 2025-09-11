'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Participant } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

const FormSchema = z.object({
  name: z.string().min(1, 'Item name is required.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  paidById: z.string().min(1, 'Please select who paid.'),
});

type AddItemFormProps = {
  addItem: (name: string, price: number, paidById: string) => void;
  participants: Participant[];
  disabled: boolean;
};

export function AddItemForm({ addItem, participants, disabled }: AddItemFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', price: '' as any, paidById: '' },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    addItem(data.name, data.price, data.paidById);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Item Name</FormLabel>
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
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input type="number" step="0.01" placeholder="0.00" className="pl-6" {...field} value={field.value ?? ''} disabled={disabled} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="paidById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid By</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {participants.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:col-span-4" disabled={disabled}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
