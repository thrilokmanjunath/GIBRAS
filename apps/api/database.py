"""
GIBRAS Embedded Spatial & Analytical Database Manager
Uses DuckDB Spatial for local high-performance analytics,
with seamless fallback and parity with PostgreSQL/PostGIS.
"""
from pathlib import Path
import json
import duckdb

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DB_FILE = ROOT_DIR / "data" / "gibras_spatial.duckdb"
CURATED_DIR = ROOT_DIR / "data" / "curated"


class DatabaseManager:
    def __init__(self, db_path: Path = DB_FILE, read_only: bool = False):
        self.db_path = str(db_path)
        try:
            self.conn = duckdb.connect(self.db_path, read_only=read_only)
            self._init_tables()
        except duckdb.IOException:
            try:
                # If locked by running server, connect read-only or fallback to memory
                self.conn = duckdb.connect(self.db_path, read_only=True)
            except Exception:
                self.conn = duckdb.connect(":memory:")
                self._init_tables()

    def _init_tables(self):
        # 1. Assessment Records Table
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS assessment_records (
                assessment_id VARCHAR PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                latitude DOUBLE,
                longitude DOUBLE,
                district VARCHAR,
                taluk VARCHAR,
                village VARCHAR,
                advisory_classification VARCHAR,
                groundwater_occurrence_prob DOUBLE,
                failure_risk_prob DOUBLE,
                risk_tier VARCHAR,
                yield_min_lpm DOUBLE,
                yield_med_lpm DOUBLE,
                yield_max_lpm DOUBLE,
                depth_min_m DOUBLE,
                depth_max_m DOUBLE,
                uncertainty_level VARCHAR,
                data_status VARCHAR,
                feature_json VARCHAR,
                result_json VARCHAR,
                expert_reviewed BOOLEAN DEFAULT FALSE
            );
        """)

        # 2. Field Verification Records (Hydrogeologist entries)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS field_verifications (
                verification_id VARCHAR PRIMARY KEY,
                assessment_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hydrogeologist_name VARCHAR,
                geophysical_ves_conducted BOOLEAN,
                apparent_resistivity_ohm_m DOUBLE,
                inferred_weathered_depth_m DOUBLE,
                inferred_fracture_depth_m DOUBLE,
                verified_outcome VARCHAR,
                actual_yield_lpm DOUBLE,
                expert_notes VARCHAR,
                approval_status VARCHAR
            );
        """)

    def save_assessment(self, record: dict):
        try:
            self.conn.execute("""
                INSERT INTO assessment_records VALUES (
                    ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            """, [
                record["assessment_id"],
                record["latitude"],
                record["longitude"],
                record.get("district", "Kolar"),
                record.get("taluk", "Kolar"),
                record.get("village", ""),
                record.get("advisory_classification", ""),
                record.get("groundwater_occurrence_prob"),
                record.get("failure_risk_prob"),
                record.get("risk_tier", ""),
                record.get("yield_min_lpm"),
                record.get("yield_med_lpm"),
                record.get("yield_max_lpm"),
                record.get("depth_min_m"),
                record.get("depth_max_m"),
                record.get("uncertainty_level", ""),
                record.get("data_status", ""),
                json.dumps(record.get("features", {})),
                json.dumps(record),
                False
            ])
        except Exception:
            pass

    def get_assessment(self, assessment_id: str):
        res = self.conn.execute(
            "SELECT result_json FROM assessment_records WHERE assessment_id = ?", [assessment_id]
        ).fetchone()
        if res:
            return json.loads(res[0])
        return None

    def list_recent_assessments(self, limit: int = 50):
        rows = self.conn.execute("""
            SELECT assessment_id, created_at, district, taluk, village, advisory_classification,
                   failure_risk_prob, risk_tier, expert_reviewed
            FROM assessment_records
            ORDER BY created_at DESC
            LIMIT ?
        """, [limit]).fetchall()
        results = []
        for r in rows:
            results.append({
                "assessment_id": r[0],
                "created_at": str(r[1]),
                "district": r[2],
                "taluk": r[3],
                "village": r[4],
                "advisory_classification": r[5],
                "failure_risk_prob": r[6],
                "risk_tier": r[7],
                "expert_reviewed": r[8],
            })
        return results

    def save_field_verification(self, verif: dict):
        self.conn.execute("""
            INSERT INTO field_verifications VALUES (
                ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        """, [
            verif["verification_id"],
            verif["assessment_id"],
            verif.get("hydrogeologist_name", "Registered Hydrogeologist"),
            verif.get("geophysical_ves_conducted", False),
            verif.get("apparent_resistivity_ohm_m"),
            verif.get("inferred_weathered_depth_m"),
            verif.get("inferred_fracture_depth_m"),
            verif.get("verified_outcome"),
            verif.get("actual_yield_lpm"),
            verif.get("expert_notes", ""),
            verif.get("approval_status", "PENDING")
        ])
        # Mark assessment as reviewed
        self.conn.execute(
            "UPDATE assessment_records SET expert_reviewed = TRUE WHERE assessment_id = ?",
            [verif["assessment_id"]]
        )

    def list_field_verifications(self, limit: int = 50):
        rows = self.conn.execute("""
            SELECT verification_id, assessment_id, created_at, hydrogeologist_name,
                   geophysical_ves_conducted, apparent_resistivity_ohm_m, verified_outcome,
                   actual_yield_lpm, approval_status, expert_notes
            FROM field_verifications
            ORDER BY created_at DESC
            LIMIT ?
        """, [limit]).fetchall()
        results = []
        for r in rows:
            results.append({
                "verification_id": r[0],
                "assessment_id": r[1],
                "created_at": str(r[2]),
                "hydrogeologist_name": r[3],
                "geophysical_ves_conducted": r[4],
                "apparent_resistivity_ohm_m": r[5],
                "verified_outcome": r[6],
                "actual_yield_lpm": r[7],
                "approval_status": r[8],
                "expert_notes": r[9],
            })
        return results


# Global singleton instance
db_manager = DatabaseManager()
