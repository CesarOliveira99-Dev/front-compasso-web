'use client';
import { useRef, useState } from 'react';
import type { BusinessAddress } from '../domain/models';
import { Field } from './ui';
import { api } from '../infrastructure/api';
export function addressFromForm(form: FormData): BusinessAddress {
  return Object.fromEntries(
    ['postalCode', 'street', 'number', 'district', 'city', 'state', 'complement'].map((key) => [
      key,
      String(form.get(`address.${key}`) || ''),
    ]),
  ) as unknown as BusinessAddress;
}
export function BusinessAddressFields({ initial }: { initial?: BusinessAddress }) {
  const [address, setAddress] = useState<BusinessAddress>(
    initial || {
      postalCode: '',
      street: '',
      number: '',
      district: '',
      city: '',
      state: '',
      complement: '',
    },
  );
  const currentCep = useRef(address.postalCode);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function lookup() {
    const cep = currentCep.current.replace(/\D/g, '');
    if (!/^\d{8}$/.test(cep)) {
      setMessage('Informe um CEP com oito dígitos ou preencha o endereço abaixo.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const result = await api<Partial<BusinessAddress>>(`location/${cep}`);
      if (currentCep.current.replace(/\D/g, '') === cep) {
        setAddress((value) => ({ ...value, ...result }));
        setMessage('Endereço encontrado. Confira e informe o número.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Preencha o endereço manualmente.');
    } finally {
      setBusy(false);
    }
  }
  function input(key: keyof BusinessAddress, label: string, maxLength: number, required = true) {
    return (
      <Field label={label}>
        <input
          name={`address.${key}`}
          required={required}
          maxLength={maxLength}
          value={address[key]}
          onChange={(event) => {
            const value = key === 'state' ? event.target.value.toUpperCase() : event.target.value;
            if (key === 'postalCode') currentCep.current = value;
            setAddress((current) => ({ ...current, [key]: value }));
          }}
        />
      </Field>
    );
  }
  return (
    <fieldset className="business-address-fields">
      <legend>Localização do estabelecimento</legend>
      <div className="address-cep-row">
        {input('postalCode', 'CEP', 9)}
        <button className="button secondary" type="button" disabled={busy} onClick={lookup}>
          {busy ? 'Buscando…' : 'Buscar CEP'}
        </button>
      </div>
      {message && (
        <p className="form-note" role="status">
          {message}
        </p>
      )}
      {input('street', 'Rua / avenida', 150)}
      <div className="form-row">
        {input('number', 'Número (ou s/n)', 20)}
        {input('district', 'Bairro', 100, false)}
      </div>
      <div className="form-row">
        {input('city', 'Cidade', 100)}
        {input('state', 'UF', 2)}
      </div>
      {input('complement', 'Complemento', 150, false)}
    </fieldset>
  );
}
