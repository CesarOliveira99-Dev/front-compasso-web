import { NextResponse } from 'next/server';
export async function GET(_request: Request, context: { params: Promise<{ cep: string }> }) {
  const { cep } = await context.params;
  if (!/^\d{8}$/.test(cep))
    return NextResponse.json({ message: 'Informe um CEP com oito dígitos.' }, { status: 400 });
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (data.erro)
      return NextResponse.json(
        { message: 'CEP não encontrado. Confira ou preencha o endereço manualmente.' },
        { status: 404 },
      );
    if (typeof data.localidade !== 'string' || typeof data.uf !== 'string') throw new Error();
    return NextResponse.json({
      postalCode: cep,
      street: data.logradouro || '',
      district: data.bairro || '',
      city: data.localidade,
      state: data.uf,
    });
  } catch {
    return NextResponse.json(
      { message: 'ViaCEP indisponível. Você pode preencher o endereço manualmente.' },
      { status: 503 },
    );
  }
}
