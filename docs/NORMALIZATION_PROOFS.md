# UniSphere: Normalization Analysis & Formal Mathematical Proofs
## Verification up to Boyce-Codd Normal Form (BCNF)

### 1. Fundamental Normalization Definitions
* **Superkey:** A set of attributes $S \subseteq R$ such that for any two distinct tuples $t_1, t_2 \in r(R)$, $t_1[S] \neq t_2[S]$.
* **Candidate Key ($K$):** A minimal superkey (no proper subset of $K$ is a superkey).
* **Prime Attribute:** An attribute that belongs to at least one candidate key of relation $R$.
* **Non-Prime Attribute:** An attribute that does not belong to any candidate key of relation $R$.
* **First Normal Form (1NF):** The domain of each attribute contains only atomic (indivisible) values, and the value of each attribute in every tuple contains only a single value from that domain.
* **Second Normal Form (2NF):** The relation is in 1NF and no non-prime attribute is partially dependent on any candidate key of $R$.
* **Third Normal Form (3NF):** The relation is in 2NF and for every non-trivial functional dependency $X \rightarrow Y$:
  * Either $X$ is a superkey of $R$, OR
  * Each attribute in $Y$ is a prime attribute of $R$.
* **Boyce-Codd Normal Form (BCNF):** The relation is in 3NF and for every non-trivial functional dependency $X \rightarrow Y$, $X$ must be a strict superkey of $R$.

---

## 2. Table-by-Table Normalization Breakdown

### Relation A: `enrollments`
* **Relation Scheme:**
  $$R_E = (\text{enrollment\_id}, \text{student\_id}, \text{offering\_id}, \text{enrollment\_date}, \text{status}, \text{final\_grade}, \text{grade\_point})$$
* **Candidate Keys:**
  * $K_1 = \{\text{enrollment\_id}\}$
  * $K_2 = \{\text{student\_id}, \text{offering\_id}\}$
* **Prime Attributes:** $\{\text{enrollment\_id}, \text{student\_id}, \text{offering\_id}\}$
* **Non-Prime Attributes:** $\{\text{enrollment\_date}, \text{status}, \text{final\_grade}, \text{grade\_point}\}$
* **Functional Dependencies:**
  1. $\text{enrollment\_id} \rightarrow \text{student\_id}, \text{offering\_id}, \text{enrollment\_date}, \text{status}, \text{final\_grade}, \text{grade\_point}$
  2. $\{\text{student\_id}, \text{offering\_id}\} \rightarrow \text{enrollment\_id}, \text{enrollment\_date}, \text{status}, \text{final\_grade}, \text{grade\_point}$
* **Proof of 1NF:** All attribute values are atomic scalars.
* **Proof of 2NF:** No non-prime attribute depends on a proper subset of $K_2$. Neither `student_id` alone nor `offering_id` alone determines `enrollment_date` or `status`. Hence, no partial functional dependency exists.
* **Proof of 3NF:** In every FD ($FD_1$ and $FD_2$), the determinant (LHS) is a candidate key / superkey.
* **Proof of BCNF:** Since every determinant is a superkey, $R_E$ strictly satisfies BCNF.

---

### Relation B: `course_offerings`
* **Relation Scheme:**
  $$R_{CO} = (\text{offering\_id}, \text{course\_id}, \text{semester\_id}, \text{faculty\_id}, \text{section}, \text{max\_capacity}, \text{current\_enrolled}, \text{classroom\_id})$$
* **Candidate Keys:**
  * $K_1 = \{\text{offering\_id}\}$
  * $K_2 = \{\text{course\_id}, \text{semester\_id}, \text{section}\}$
* **Functional Dependencies:**
  1. $\text{offering\_id} \rightarrow \text{course\_id}, \text{semester\_id}, \text{faculty\_id}, \text{section}, \text{max\_capacity}, \text{current\_enrolled}, \text{classroom\_id}$
  2. $\{\text{course\_id}, \text{semester\_id}, \text{section}\} \rightarrow \text{offering\_id}, \text{faculty\_id}, \text{max\_capacity}, \text{current\_enrolled}, \text{classroom\_id}$
* **BCNF Conformance:** Both determinants are candidate keys. There are no non-trivial FDs where the LHS is not a superkey.

---

### Relation C: `fee_invoices`
* **Relation Scheme:**
  $$R_{FI} = (\text{invoice\_id}, \text{invoice\_number}, \text{student\_id}, \text{semester\_id}, \text{gross\_amount}, \text{scholarship\_deduction}, \text{net\_payable}, \text{paid\_amount}, \text{balance\_amount}, \text{due\_date}, \text{status})$$
* **Candidate Keys:**
  * $K_1 = \{\text{invoice\_id}\}$
  * $K_2 = \{\text{invoice\_number}\}$
  * $K_3 = \{\text{student\_id}, \text{semester\_id}\}$
* **Functional Dependencies:**
  * Any of $K_1, K_2, K_3$ functionally determine all other attributes.
* **BCNF Conformance:** Every non-trivial FD is determined by a superkey. No transitive dependency on non-prime attributes exists.

---

## 3. Anomalies Eliminated by Schema Normalization

| Anomaly Type | Unnormalized Design Risk | UniSphere 3NF/BCNF Solution |
| :--- | :--- | :--- |
| **Insertion Anomaly** | Cannot record a course in the catalog without scheduling an offering and instructor. | Decoupled into `courses` (catalog master) and `course_offerings` (term execution). Courses exist independently of offerings. |
| **Deletion Anomaly** | Deleting a graduating student deletes historical course catalog records or faculty employment data. | Normalized `students`, `enrollments`, `courses`, and `faculty` with `ON DELETE RESTRICT` foreign keys. |
| **Update Anomaly** | Updating a course title (e.g. from *DBMS* to *Advanced Database Systems*) requires mutating 10,000 historical enrollment rows. | Course title is stored exactly once in `courses`. Historical enrollments reference `offering_id` $\rightarrow$ `course_id`. |
| **Transitive Anomaly** | Storing `department_name` inside `students` creates dependency $\text{student\_id} \rightarrow \text{program\_id} \rightarrow \text{department\_id} \rightarrow \text{department\_name}$. | Normalized across `students` $\rightarrow$ `programs` $\rightarrow$ `departments`. |

