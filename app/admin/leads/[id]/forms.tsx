'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label, Textarea } from '@/components/ui/Field';
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from '@/lib/admin/lead-status';
import { removeLead, saveLead, type SaveState } from '../../actions';

export function LeadEditForm({
  id,
  status,
  memo,
}: {
  id: string;
  status: LeadStatus;
  memo: string;
}) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveLead, {});

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={id} />
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">상태</legend>
        <div className="grid grid-cols-2 gap-2">
          {LEAD_STATUSES.map((value) => (
            <label
              key={value}
              className="border-border has-checked:border-primary has-checked:bg-primary-soft flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm"
            >
              <input
                type="radio"
                name="status"
                value={value}
                defaultChecked={value === status}
              />
              {STATUS_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <Label htmlFor="memo">내부 메모</Label>
        <Textarea id="memo" name="memo" defaultValue={memo} maxLength={5000} />
      </div>
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      {state.ok && !pending ? (
        <p role="status" className="text-sm text-emerald-700">
          저장했습니다.
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? '저장 중…' : '저장'}
      </Button>
    </form>
  );
}

export function DeleteLeadForm({ id }: { id: string }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form action={removeLead} className="mt-4 space-y-3">
      <input type="hidden" name="id" value={id} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="confirm"
          value="yes"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        이 문의를 영구 삭제합니다
      </label>
      <Button
        type="submit"
        variant="outline"
        className="text-danger w-full"
        disabled={!confirmed}
      >
        삭제
      </Button>
    </form>
  );
}
