import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '../services/base44Client';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from "./ui/button";
import PersonForm from './person/PersonForm';
import { Person, User } from '../types';

export default function RegisterPerson() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const generateCAD = async () => {
    // Get all persons to find the highest CAD number
    const allPersons = await base44.entities.Person.list();
    let maxNumber = 0;
    
    allPersons.forEach(p => {
      if (p.cad) {
        const num = parseInt(p.cad.replace('CAD-', ''), 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `CAD-${String(nextNumber).padStart(5, '0')}`;
  };

  const handleSubmit = async (formData: Partial<Person>) => {
    setIsLoading(true);
    
    try {
      // Generate unique CAD number
      const cad = await generateCAD();
      
      const personData = {
        ...formData,
        cad,
        last_edited_by: user?.email,
        last_edited_by_cad: user?.cad,
        // Ensure status is of the correct type
        status: formData.status || 'procurado'
      };

      const person = await base44.entities.Person.create(personData as any);

      // Create audit log
      await base44.entities.AuditLog.create({
        action: 'create',
        entity_type: 'Person',
        entity_id: person.id,
        entity_name: formData.full_name || 'Desconhecido',
        user_email: user?.email,
        user_name: user?.full_name,
        details: `Cadastro criado: ${formData.full_name}`
      });

      navigate(createPageUrl(`ViewPerson?id=${person.id}`));
    } catch (error) {
      console.error("Error creating person:", error);
      // In a real app, show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Novo Registro</h1>
              <p className="text-slate-500">BUD 35 - Cadastro de Pessoa</p>
            </div>
          </div>
        </div>

        <PersonForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}