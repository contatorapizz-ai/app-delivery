import { supabase } from '../lib/supabase'
import { getAdSessionId } from '../lib/adSession'
import { reaisToCents } from '../lib/mappers'
import type { AdCampaignRow, AdFormat, AdObjective, StoreRow } from '../types/database'

export async function fetchMyStore(ownerId: string): Promise<StoreRow | undefined> {
  const { data, error } = await supabase.from('stores').select('*').eq('owner_id', ownerId).maybeSingle()
  if (error) throw error
  return (data as StoreRow | null) ?? undefined
}

export async function createStore(input: {
  ownerId: string
  name: string
  category: string
  address: string
  whatsapp: string
  deliveryFee: number
  minOrder: number
}): Promise<StoreRow> {
  const { data, error } = await supabase
    .from('stores')
    .insert({
      owner_id: input.ownerId,
      name: input.name,
      category: input.category,
      address: input.address,
      whatsapp: input.whatsapp,
      delivery_fee_cents: reaisToCents(input.deliveryFee),
      min_order_cents: reaisToCents(input.minOrder),
    })
    .select('*')
    .single()
  if (error) throw error
  return data as StoreRow
}

export async function createCampaign(input: {
  storeId: string
  objective: AdObjective
  format: AdFormat
  title: string
  description: string
  budget: number
  startsAt: string
  endsAt: string
}): Promise<AdCampaignRow> {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .insert({
      store_id: input.storeId,
      objective: input.objective,
      format: input.format,
      title: input.title,
      description: input.description,
      budget_cents: reaisToCents(input.budget),
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: 'pendente_pagamento',
    })
    .select('*')
    .single()
  if (error) throw error
  return data as AdCampaignRow
}

export async function fetchMyCampaigns(storeId: string): Promise<AdCampaignRow[]> {
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AdCampaignRow[]
}

export async function activateCampaign(campaignId: string): Promise<void> {
  const { error } = await supabase.rpc('activate_campaign', { p_campaign_id: campaignId })
  if (error) throw error
}

export async function fetchActiveCampaignsByFormat(format: AdFormat, limit = 5): Promise<AdCampaignRow[]> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('format', format)
    .eq('status', 'ativa')
    .lte('starts_at', today)
    .gte('ends_at', today)
    .limit(limit)
  if (error) throw error
  return data as AdCampaignRow[]
}

export async function trackAdEvent(campaignId: string, type: 'impressao' | 'clique'): Promise<void> {
  await supabase.from('ad_events').insert({
    campaign_id: campaignId,
    type,
    session_id: getAdSessionId(),
  })
}

export async function fetchCampaignMetrics(campaignId: string): Promise<{ impressions: number; clicks: number }> {
  const [{ count: impressions }, { count: clicks }] = await Promise.all([
    supabase.from('ad_events').select('*', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('type', 'impressao'),
    supabase.from('ad_events').select('*', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('type', 'clique'),
  ])
  return { impressions: impressions ?? 0, clicks: clicks ?? 0 }
}

export interface AdminTotals {
  totalAdsCents: number
  totalPlatformCents: number
  totalFundCents: number
  activeCampaigns: number
}

export async function fetchAdminTotals(): Promise<AdminTotals> {
  const { data: ledger, error: ledgerError } = await supabase
    .from('fund_ledger')
    .select('gross_cents, platform_cents, fund_cents')
  if (ledgerError) throw ledgerError

  const { count: activeCampaigns, error: campaignsError } = await supabase
    .from('ad_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ativa')
  if (campaignsError) throw campaignsError

  const rows = (ledger ?? []) as { gross_cents: number; platform_cents: number; fund_cents: number }[]
  return {
    totalAdsCents: rows.reduce((sum, r) => sum + r.gross_cents, 0),
    totalPlatformCents: rows.reduce((sum, r) => sum + r.platform_cents, 0),
    totalFundCents: rows.reduce((sum, r) => sum + r.fund_cents, 0),
    activeCampaigns: activeCampaigns ?? 0,
  }
}
