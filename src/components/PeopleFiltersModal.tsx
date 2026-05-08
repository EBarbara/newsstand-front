"use client";

import React, { useState } from 'react';
import { Tag } from '@/@types/tag';

interface Filter {
    id: string;
    field: string;
    label: string;
    operation: string;
    value: string;
    displayValue: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: Record<string, string>) => void;
    currentFilters: Record<string, string>;
    availableTags: Tag[];
}

const FIELDS = [
    { id: 'name', label: 'Nome', type: 'text', operations: [
        { id: 'icontains', label: 'Contém' },
        { id: 'exclude', label: 'Não Contém' }
    ] },
    { id: 'gender', label: 'Gênero', type: 'select', options: [
        { id: 'M', label: 'Masculino' },
        { id: 'F', label: 'Feminino' },
        { id: 'TM', label: 'Transsexual Masculino' },
        { id: 'TF', label: 'Transsexual Feminino' },
        { id: 'I', label: 'Intersexual' },
        { id: 'NB', label: 'Não-binário' },
    ], operations: [
        { id: 'exact', label: 'Igual a' },
        { id: 'exclude', label: 'Diferente de' }
    ] },
    { id: 'country', label: 'País', type: 'text', operations: [
        { id: 'exact', label: 'Igual a' },
        { id: 'exclude', label: 'Diferente de' }
    ] },
    { id: 'birth_date_after', label: 'Nascido Após', type: 'date', operations: [{ id: 'gte', label: '>=' }] },
    { id: 'birth_date_before', label: 'Nascido Antes', type: 'date', operations: [{ id: 'lte', label: '<=' }] },
    { id: 'tag', label: 'Tag', type: 'select', options: [], operations: [
        { id: 'exact', label: 'Igual a' },
        { id: 'exclude', label: 'Diferente de' }
    ] },
];

export default function PeopleFiltersModal({ isOpen, onClose, onApply, currentFilters, availableTags }: Props) {
    const [selectedFieldId, setSelectedFieldId] = useState(FIELDS[0].id);
    const [selectedOpId, setSelectedOpId] = useState(FIELDS[0].operations[0].id);
    const [filterValue, setFilterValue] = useState('');
    
    // We'll manage active filters as an object for the API, but display them as a list
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>(currentFilters);

    if (!isOpen) return null;

    const selectedField = FIELDS.find(f => f.id === selectedFieldId) || FIELDS[0];
    const fieldOptions = selectedFieldId === 'tag' 
        ? availableTags.map(t => ({ id: t.slug, label: t.name }))
        : selectedField.options || [];

    const handleAddFilter = () => {
        if (!filterValue) return;

        // Map field + operation to the correct API key
        let apiKey = selectedFieldId;
        if (selectedOpId === 'exclude') {
            apiKey = `${selectedFieldId}_exclude`;
        }

        const newFilters = { ...activeFilters, [apiKey]: filterValue };
        setActiveFilters(newFilters);
        setFilterValue('');
    };

    const removeFilter = (key: string) => {
        const newFilters = { ...activeFilters };
        delete newFilters[key];
        setActiveFilters(newFilters);
    };

    const handleApply = () => {
        onApply(activeFilters);
        onClose();
    };

    const getDisplayLabel = (key: string, value: string) => {
        const isExclude = key.endsWith('_exclude');
        const baseKey = isExclude ? key.replace('_exclude', '') : key;
        const field = FIELDS.find(f => f.id === baseKey);
        
        if (!field) return `${key}: ${value}`;
        
        let valLabel = value;
        if (baseKey === 'tag') {
            valLabel = availableTags.find(t => t.slug === value)?.name || value;
        } else if (field.options) {
            valLabel = field.options.find(o => o.id === value)?.label || value;
        }

        const opLabel = isExclude ? '≠' : '=';
        return `${field.label} ${opLabel} ${valLabel}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#161a20] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">Filtros Avançados</h2>
                    <p className="text-sm text-gray-500 mt-1">Combine múltiplos critérios para refinar sua busca.</p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* ADD NEW FILTER */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Campo</label>
                                <select 
                                    value={selectedFieldId}
                                    onChange={(e) => { 
                                        const fieldId = e.target.value;
                                        setSelectedFieldId(fieldId); 
                                        setFilterValue('');
                                        const field = FIELDS.find(f => f.id === fieldId);
                                        if (field) setSelectedOpId(field.operations[0].id);
                                    }}
                                    className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                                >
                                    {FIELDS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Operação</label>
                                <select 
                                    value={selectedOpId}
                                    onChange={(e) => setSelectedOpId(e.target.value)}
                                    className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                                >
                                    {selectedField.operations.map(op => <option key={op.id} value={op.id}>{op.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Valor</label>
                                {selectedField.type === 'select' || selectedFieldId === 'tag' ? (
                                    <select 
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Selecionar...</option>
                                        {fieldOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                    </select>
                                ) : (
                                    <input 
                                        type={selectedField.type}
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        placeholder="Valor..."
                                        className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleAddFilter}
                            disabled={!filterValue}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-all text-sm"
                        >
                            + Adicionar Critério
                        </button>
                    </div>

                    {/* ACTIVE FILTERS */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Filtros Ativos</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(activeFilters).length === 0 ? (
                                <p className="text-xs text-gray-600 italic">Nenhum filtro aplicado.</p>
                            ) : (
                                Object.entries(activeFilters).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold animate-in fade-in zoom-in duration-200">
                                        <span>{getDisplayLabel(key, value)}</span>
                                        <button 
                                            onClick={() => removeFilter(key)}
                                            className="hover:text-white transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button 
                        onClick={() => { setActiveFilters({}); }}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Limpar Tudo
                    </button>
                    <div className="flex-1" />
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleApply}
                        className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all text-sm"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}
