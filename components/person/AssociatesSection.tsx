import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Users, Search, X, Loader2, UserPlus } from 'lucide-react';
import { base44 } from '../../services/base44Client';
import { Person } from '../../types';

interface AssociatesSectionProps {
  associates: string[];
  onUpdate: (associates: string[]) => void;
}

export default function AssociatesSection({ associates, onUpdate }: AssociatesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [associatedPersons, setAssociatedPersons] = useState<Person[]>([]);

  // Load details for existing associates
  useEffect(() => {
    const loadAssociates = async () => {
      if (associates.length === 0) {
        setAssociatedPersons([]);
        return;
      }
      const all = await base44.entities.Person.list();
      const found = all.filter(p => p.cad && associates.includes(p.cad));
      setAssociatedPersons(found);
    };
    loadAssociates();
  }, [associates]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    const all = await base44.entities.Person.list();
    const term = searchTerm.toLowerCase();
    const results = all.filter(p => 
      (p.full_name.toLowerCase().includes(term) || 
       p.cad?.toLowerCase().includes(term) ||
       p.nickname?.toLowerCase().includes(term)) &&
      !associates.includes(p.cad!)
    ).slice(0, 5);
    setSearchResults(results);
    setIsSearching(false);
  };

  const addAssociate = (cad: string) => {
    if (!associates.includes(cad)) {
      onUpdate([...associates, cad]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const removeAssociate = (cad: string) => {
    onUpdate(associates.filter(c => c !== cad));
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-800">
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5" />
          Comparsas / Vínculos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Buscar por nome, vulgo ou CAD..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching} type="button">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="border rounded-md divide-y">
            {searchResults.map(person => (
              <div key={person.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-medium text-sm">{person.full_name}</p>
                  <p className="text-xs text-slate-500">{person.cad} - {person.nickname}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => addAssociate(person.cad!)} type="button">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
            <p className="text-sm text-slate-500 font-medium">Vínculos Adicionados ({associates.length})</p>
            {associatedPersons.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum vínculo registrado.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {associatedPersons.map(person => (
                    <div key={person.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                            {person.photos?.[0] ? (
                                <img src={person.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Users className="w-5 h-5 text-slate-500 m-auto mt-2.5" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="font-medium text-sm truncate">{person.full_name}</p>
                             <p className="text-xs text-slate-500">{person.cad}</p>
                        </div>
                        <button onClick={() => removeAssociate(person.cad!)} type="button" className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}