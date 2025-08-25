import { useEffect, useMemo, useState } from 'react';
import { AllureApiClient } from '../api/allure.api';
import { DEFAULT_PROJECT_ID } from '../constants';

type Props = {
    jwtToken: string;
};

export function TestRuns({ jwtToken }: Props) {
    const client = useMemo(() => new AllureApiClient({ jwtToken }), [jwtToken]);
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);
    const [items, setItems] = useState<any[]>([]);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await client.getLaunches({
                projectId: DEFAULT_PROJECT_ID,
                search
            });
            const content = Array.isArray(data?.content) ? data.content : [];
            setRuns(content);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [jwtToken]);

    useEffect(() => {
        load();
    }, [search]);

    const complete = async (id: number) => {
        await client.completeLaunch(id);
        await load();
    };

    const openLaunch = async (id: number) => {
        setSelectedLaunchId(id);
        try {
            setLoading(true);
            const data = await client.getLaunchItems({
                launchId: id
            });
            setItems(Array.isArray(data?.content) ? data.content : []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8
                }}
            >
                <h2 style={{ margin: 0 }}>Launches (project {DEFAULT_PROJECT_ID})</h2>
                <input
                    placeholder="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <button onClick={load}>Refresh</button>
            </div>
            {runs.length === 0 ? (
                <p>No runs</p>
            ) : (
                <ul>
                    {runs.map(r => (
                        <li
                            key={String(r.id)}
                            style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                        >
                            <button onClick={() => openLaunch(r.id)} title="Open">
                                Open
                            </button>
                            <span>
                                #{r.id} {r.name ?? ''} {r.closed ? '(closed)' : ''}
                            </span>
                            <button onClick={() => complete(r.id)}>Complete</button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedLaunchId && (
                <div style={{ marginTop: 16 }}>
                    <h3 style={{ margin: 0 }}>Items in launch #{selectedLaunchId}</h3>
                    {items.length === 0 ? (
                        <p>No items</p>
                    ) : (
                        <ul>
                            {items.map((it: any) => (
                                <li key={String(it.id)}>{it.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
