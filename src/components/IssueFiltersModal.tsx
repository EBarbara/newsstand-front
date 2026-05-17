"use client";

import React, { useState, useEffect } from 'react';
import { Tag } from '@/@types/tag';

interface ActiveFilter {
    id: string;
    fieldId: string;
    opId: string;
    value: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: Record<string, string | string[]>) => void;
    currentFilters: Record<string, string | string[]>;
    availableTags: Tag[];
}

const FIELDS = [
    { id: 'tag', label: 'Tag da Edição', type: 'select', operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'tag' },
        { id: 'exclude', label: 'Diferente de', apiKey: 'tag_exclude' }
    ] },
    { id: 'person_tag', label: 'Tag de Pessoa (Major Credit)', type: 'select', operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'person_tag' }
    ] },
    { id: 'year', label: 'Ano de Publicação', type: 'number', operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'year' },
        { id: 'gt', label: 'Maior que (>)', apiKey: 'year_gt' },
        { id: 'gte', label: 'Maior ou Igual (≥)', apiKey: 'year_gte' },
        { id: 'lt', label: 'Menor que (<)', apiKey: 'year_lt' },
        { id: 'lte', label: 'Menor ou Igual (≤)', apiKey: 'year_lte' },
        { id: 'ne', label: 'Diferente de (≠)', apiKey: 'year_ne' },
    ] },
    { id: 'is_special', label: 'Tipo de Edição', type: 'select', options: [
        { id: 'false', label: 'Mensal' },
        { id: 'true', label: 'Especial ⭐' },
    ], operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'is_special' }
    ] },
    { id: 'has_physical_copy', label: 'Possuo física', type: 'select', options: [
        { id: 'true', label: 'Sim' },
        { id: 'false', label: 'Não' },
    ], operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'has_physical_copy' }
    ] },
    { id: 'is_digital_complete', label: 'Digital completa', type: 'select', options: [
        { id: 'true', label: 'Sim' },
        { id: 'false', label: 'Não' },
    ], operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'is_digital_complete' }
    ] },
    { id: 'person_age', label: 'Idade da Pessoa (na data)', type: 'number', operations: [
        { id: 'exact', label: 'Igual a', apiKey: 'person_age_eq' },
        { id: 'gt', label: 'Maior que (>)', apiKey: 'person_age_gt' },
        { id: 'gte', label: 'Maior ou Igual (≥)', apiKey: 'person_age_gte' },
        { id: 'lt', label: 'Menor que (<)', apiKey: 'person_age_lt' },
        { id: 'lte', label: 'Menor ou Igual (≤)', apiKey: 'person_age_lte' },
        { id: 'ne', label: 'Diferente de (≠)', apiKey: 'person_age_ne' },
    ] },
];

export default function IssueFiltersModal({ isOpen, onClose, onApply, currentFilters, availableTags }: Props) {
    const [selectedFieldId, setSelectedFieldId] = useState(FIELDS[0].id);
    const [selectedOpId, setSelectedOpId] = useState(FIELDS[0].operations[0].id);
    const [filterValue, setFilterValue] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

    // Sync internal state with props when modal opens
    useEffect(() => {
        if (isOpen) {
            const initial: ActiveFilter[] = [];
            Object.entries(currentFilters).forEach(([apiKey, val]) => {
                const values = Array.isArray(val) ? val : [val];
                values.forEach((v, index) => {
                    // Find which field and op this apiKey corresponds to
                    let found = false;
                    for (const field of FIELDS) {
                        for (const op of field.operations) {
                            if (op.apiKey === apiKey) {
                                initial.push({
                                    id: `${apiKey}-${v}-${index}-${Math.random()}`,
                                    fieldId: field.id,
                                    opId: op.id,
                                    value: v
                                });
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                });
            });
            setActiveFilters(initial);
        }
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const selectedField = FIELDS.find(f => f.id === selectedFieldId) || FIELDS[0];
    const fieldOptions = (selectedFieldId === 'tag' || selectedFieldId === 'person_tag')
        ? availableTags
            .filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
            .map(t => ({ id: t.slug, label: t.name }))
        : selectedField.options || [];

    const handleAddFilter = () => {
        if (!filterValue) return;

        const newFilter: ActiveFilter = {
            id: Date.now().toString(),
            fieldId: selectedFieldId,
            opId: selectedOpId,
            value: filterValue
        };

        setActiveFilters([...activeFilters, newFilter]);
        setFilterValue('');
    };

    const removeFilter = (id: string) => {
        setActiveFilters(activeFilters.filter(f => f.id !== id));
    };

    const handleApply = () => {
        const result: Record<string, string | string[]> = {};
        activeFilters.forEach(f => {
            const field = FIELDS.find(fi => fi.id === f.fieldId);
            const op = field?.operations.find(o => o.id === f.opId);
            const apiKey = op?.apiKey || f.fieldId;

            if (result[apiKey]) {
                if (Array.isArray(result[apiKey])) {
                    (result[apiKey] as string[]).push(f.value);
                } else {
                    result[apiKey] = [result[apiKey] as string, f.value];
                }
            } else {
                result[apiKey] = f.value;
            }
        });
        onApply(result);
        onClose();
    };

    const getDisplayLabel = (filter: ActiveFilter) => {
        const field = FIELDS.find(f => f.id === filter.fieldId);
        const op = field?.operations.find(o => o.id === filter.opId);
        
        if (!field || !op) return filter.value;
        
        let valLabel = filter.value;
        if (filter.fieldId === 'tag' || filter.fieldId === 'person_tag') {
            valLabel = availableTags.find(t => t.slug === filter.value)?.name || filter.value;
        } else if (field.options) {
            valLabel = field.options.find(o => o.id === filter.value)?.label || filter.value;
        }

        return `${field.label} ${op.label} ${valLabel}`;
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
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-gray-400">Campo</label>
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
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-gray-400">Operação</label>
                                <select 
                                    value={selectedOpId}
                                    onChange={(e) => setSelectedOpId(e.target.value)}
                                    className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                                >
                                    {selectedField.operations.map(op => <option key={op.id} value={op.id}>{op.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-gray-400">Valor</label>
                                {(selectedFieldId === 'tag' || selectedFieldId === 'person_tag') && (
                                    <input
                                        type="text"
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                        placeholder="Buscar tag..."
                                        className="w-full bg-[#161a20] border border-white/10 rounded-lg p-2 mb-1 text-sm text-blue-300 focus:border-blue-500 outline-none"
                                    />
                                )}
                                {selectedField.type === 'select' || selectedFieldId === 'tag' || selectedFieldId === 'person_tag' ? (
                                    <select 
                                        value={filterValue}
                                        onChange={(e) => setFilterValue(e.target.value)}
                                        className="w-full bg-[#0b0e14] border border-white/10 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Selecionar...</option>
                                        {fieldOptions.length === 0 && tagSearch && (
                                            <option disabled>Nenhum resultado encontrado</option>
                                        )}
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
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-gray-400">Filtros Ativos</label>
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.length === 0 ? (
                                <p className="text-xs text-gray-600 italic">Nenhum filtro aplicado.</p>
                            ) : (
                                activeFilters.map((filter) => (
                                    <div key={filter.id} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold animate-in fade-in zoom-in duration-200">
                                        <span>{getDisplayLabel(filter)}</span>
                                        <button 
                                            onClick={() => removeFilter(filter.id)}
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
                        onClick={() => { setActiveFilters([]); }}
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
