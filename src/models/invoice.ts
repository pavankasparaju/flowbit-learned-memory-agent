export interface Invoice {
  id: string;
  vendor: string;
  extracted: Record<string, string>;
}
