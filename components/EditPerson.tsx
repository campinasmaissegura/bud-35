import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '../services/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Button } from "./ui/button";
import PersonForm from './person/PersonForm';
import { Person, User } from '../types';

export default function EditPerson() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const personId = urlParams.get('id');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: person, isLoading: loadingPerson } = useQuery({
    queryKey: ['person', personId],
    queryFn: () => base44.entities.Person.filter({ id: personId! }),
    select: (data) => data[0],
    enabled: !!personId,
  });

  const handleSubmit = async (formData: Partial<Person>) => {
    if (!personId) return;
    setIsLoading(true);
    
    try {
        await base44.entities.Person.update(personId, {
        ...formData,
        last_edited_by: user?.email,
        last_edited_by_cad: user?.cad
        });

        // Create audit log
        await base44.entities.AuditLog.create({
        action: 'update',
        entity_type: 'Person',
        entity_id: personId,
        entity_name: formData.full_name,
        user_email: user?.email,
        user_name: user?.full_name,
        details: `Cadastro atualizado: ${formData.full_name}`
        });

        navigate(createPageUrl(`ViewPerson?id=${personId}`));
    } catch (error) {
        console.error("Failed to update person", error);
    } finally {
        setIsLoading(false);
    }
  };

  if (loadingPerson) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registro não encontrado</h2>
          <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl(`ViewPerson?id=${personId}`))}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Edit className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Editar Registro</h1>
              <p className="text-slate-500">{person.full_name}</p>
            </div>
          </div>
        </div>

        <PersonForm 
          initialData={person} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}