import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';

const profileSchema = z.object({
  company_name: z.string().optional(),
  company_services: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { company_name: '', company_services: '' },
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar perfil.');
        }

        const data = await response.json();
        // Ensure null values are converted to empty strings for form fields
        form.reset({
          company_name: data.company_name || '',
          company_services: data.company_services || '',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados do perfil.';
        toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      } finally {
        setIsFetching(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, form, toast]);

  const onSubmit = async (values: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar perfil.');
      }

      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Perfil da Empresa</h1>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Dados da sua Empresa</CardTitle>
            <CardDescription>Estas informações ajudarão a IA a encontrar leads mais relevantes para você.</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <p>Carregando perfil...</p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua Empresa Ltda." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviços Oferecidos</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ex: Consultoria em marketing digital, desenvolvimento de software, energia solar." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Perfil'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};